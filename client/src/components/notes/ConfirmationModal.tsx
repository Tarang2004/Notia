import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText,
  onConfirm,
  onCancel,
  isDestructive = false
}: ConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md" data-testid="confirmation-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <AlertTriangle className={`w-5 h-5 ${isDestructive ? 'text-red-500' : 'text-yellow-500'}`} />
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">{message}</p>
          
          <div className="flex space-x-3">
            <Button
              onClick={onConfirm}
              className={`flex-1 ${isDestructive ? 'bg-red-500 hover:bg-red-600' : ''}`}
              variant={isDestructive ? "destructive" : "default"}
              data-testid="button-confirm"
            >
              {confirmText}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
