import { useState, useCallback } from "react";

export function useEncryption() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'encrypt' | 'decrypt';
    noteId: string;
    callback: (password: string) => Promise<boolean>;
  } | null>(null);

  const requestPassword = useCallback((
    type: 'encrypt' | 'decrypt',
    noteId: string,
    callback: (password: string) => Promise<boolean>
  ) => {
    setPendingAction({ type, noteId, callback });
    setIsPasswordModalOpen(true);
  }, []);

  const submitPassword = useCallback(async (password: string): Promise<boolean> => {
    if (!pendingAction) return false;

    try {
      const success = await pendingAction.callback(password);
      if (success) {
        setIsPasswordModalOpen(false);
        setPendingAction(null);
      }
      return success;
    } catch (error) {
      console.error("Password action failed:", error);
      return false;
    }
  }, [pendingAction]);

  const cancelPassword = useCallback(() => {
    setIsPasswordModalOpen(false);
    setPendingAction(null);
  }, []);

  return {
    isPasswordModalOpen,
    pendingAction,
    requestPassword,
    submitPassword,
    cancelPassword
  };
}
