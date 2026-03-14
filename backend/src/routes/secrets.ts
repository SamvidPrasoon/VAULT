import { Router, Response } from "express";
import { validate as isUUID } from "uuid";
import pool from "../db/client.js";
import { authRequest, authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorization.js";
import {
  getSecret,
  createSecret,
  updateSecret,
  rotateSecret,
  deleteSecret,
  listAwsSecrets,
} from "../services/awsSecret.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/secrets
 * List all secrets for logged in user
 */
router.get("/", async (req: authRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, aws_secret_id, created_at, updated_at
       FROM secrets
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user!.userId],
    );

    res.json({ secrets: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch secrets" });
  }
});

/**
 * GET /api/secrets/aws
 * List all AWS secrets (admin only)
 */
router.get(
  "/aws",
  authorize("admin"),
  async (_req: authRequest, res: Response): Promise<void> => {
    try {
      const awsSecrets = await listAwsSecrets();
      res.json({ awsSecrets });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch AWS secrets" });
    }
  },
);

/**
 * GET /api/secrets/:id
 * Get secret value
 */
router.get(
  "/:id",
  authorize("admin"),
  async (req: authRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!isUUID(id)) {
      res.status(400).json({ error: "Invalid secret id" });
      return;
    }

    try {
      const result = await pool.query(
        "SELECT * FROM secrets WHERE id = $1 AND user_id = $2",
        [id, req.user!.userId],
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "Secret not found" });
        return;
      }

      const secret = result.rows[0];
      const value = await getSecret(secret.aws_secret_id);

      res.json({
        secret: {
          id: secret.id,
          name: secret.name,
          description: secret.description,
          value,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch secret value" });
    }
  },
);

/**
 * POST /api/secrets
 * Create a new secret
 */
router.post("/", async (req: authRequest, res: Response): Promise<void> => {
  const { name, value, description } = req.body || {};

  if (!name || !value) {
    res.status(400).json({ error: "Name and value are required" });
    return;
  }

  try {
    const awsSecretName = `vaultapi/${req.user!.userId}/${name}`;

    const awsArn = await createSecret(awsSecretName, value);

    const result = await pool.query(
      `INSERT INTO secrets (user_id, name, description, aws_secret_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, description, aws_secret_id, created_at, updated_at`,
      [req.user!.userId, name, description || null, awsArn],
    );

    res.status(201).json({ secret: result.rows[0] });
  } catch (err: any) {
    console.error(err);

    if (err.name === "ResourceExistsException") {
      res.status(409).json({ error: "Secret with this name already exists" });
      return;
    }

    res.status(500).json({ error: "Failed to create secret" });
  }
});

/**
 * PUT /api/secrets/:id
 * Update secret value
 */
router.put("/:id", async (req: authRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { value, description } = req.body || {};

  if (!isUUID(id)) {
    res.status(400).json({ error: "Invalid secret id" });
    return;
  }

  if (!value) {
    res.status(400).json({ error: "Value is required" });
    return;
  }

  try {
    const result = await pool.query(
      "SELECT * FROM secrets WHERE id = $1 AND user_id = $2",
      [id, req.user!.userId],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Secret not found" });
      return;
    }

    const secret = result.rows[0];

    await updateSecret(secret.aws_secret_id, value);

    const updated = await pool.query(
      `UPDATE secrets
       SET description = COALESCE($1, description), updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING id, name, description, aws_secret_id, created_at, updated_at`,
      [description || null, id, req.user!.userId],
    );

    res.json({ secret: updated.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update secret" });
  }
});

/**
 * POST /api/secrets/:id/rotate
 * Rotate secret value
 */
router.post(
  "/:id/rotate",
  authorize("admin"),
  async (req: authRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!isUUID(id)) {
      res.status(400).json({ error: "Invalid secret id" });
      return;
    }

    try {
      const result = await pool.query(
        "SELECT * FROM secrets WHERE id = $1 AND user_id = $2",
        [id, req.user!.userId],
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "Secret not found" });
        return;
      }

      const secret = result.rows[0];

      const newValue = await rotateSecret(secret.aws_secret_id);

      await pool.query("UPDATE secrets SET updated_at = NOW() WHERE id = $1", [
        id,
      ]);

      res.json({
        message: "Secret rotated successfully",
        newValue,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to rotate secret" });
    }
  },
);

/**
 * DELETE /api/secrets/:id
 * Delete secret
 */
router.delete(
  "/:id",
  authorize("admin"),
  async (req: authRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!isUUID(id)) {
      res.status(400).json({ error: "Invalid secret id" });
      return;
    }

    try {
      const result = await pool.query(
        "SELECT * FROM secrets WHERE id = $1 AND user_id = $2",
        [id, req.user!.userId],
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "Secret not found" });
        return;
      }

      const secret = result.rows[0];

      await deleteSecret(secret.aws_secret_id);

      await pool.query("DELETE FROM secrets WHERE id = $1", [id]);

      res.json({ message: "Secret deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete secret" });
    }
  },
);

export default router;
