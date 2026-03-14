import { useState } from 'react';
import { useSecret, useUpdateSecret } from '../api/hooks/useSecrets';
import type { Secret } from '../api/types';

interface SecretModalProps {
  secret: Secret;
  onClose: () => void;
}

export default function SecretModal({ secret, onClose }: SecretModalProps) {
  const { data, isLoading } = useSecret(secret.id);
  const updateSecret = useUpdateSecret();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const [description, setDescription] = useState(secret.description || '');

  const handleUpdate = async () => {
    try {
      await updateSecret.mutateAsync({
        id: secret.id,
        data: { value: value || undefined, description },
      });
      setIsEditing(false);
      setValue('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h3 className="text-lg font-light text-white">{secret.name}</h3>
            <p className="text-white/40 text-xs mt-1">ID: {secret.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm text-white/60 mb-2">Description</label>
            {isEditing ? (
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
              />
            ) : (
              <p className="text-white/80">{secret.description || 'No description'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Secret Value</label>
            {isLoading ? (
              <div className="text-white/40">Loading...</div>
            ) : isEditing ? (
              <input
                type="password"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter new value"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all font-mono"
              />
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div className="font-mono text-green-400 text-sm">
                  {data?.secret?.value || '••••••••••••••••'}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-white/30 pt-2">
            <span>Created: {new Date(secret.created_at).toLocaleDateString()}</span>
            <span>Updated: {new Date(secret.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-white/5">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-white/60 hover:text-white border border-white/10 rounded-lg hover:border-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updateSecret.isPending}
                className="px-5 py-2 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-all disabled:opacity-50"
              >
                {updateSecret.isPending ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-5 py-2 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-all"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
