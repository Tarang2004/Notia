import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  Key, 
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface PasswordModalProps {
  isOpen: boolean;
  type: 'encrypt' | 'decrypt' | null;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

export function PasswordModal({
  isOpen,
  type,
  onSubmit,
  onCancel
}: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEncrypt = type === 'encrypt';
  const isDecrypt = type === 'decrypt';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEncrypt && password !== confirmPassword) {
      return; // Show error or handle mismatch
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(password);
      handleClose();
    } catch (error) {
      console.error('Password operation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsSubmitting(false);
    onCancel();
  };

  const getModalContent = () => {
    if (isEncrypt) {
      return {
        title: "🔒 Encrypt Your Note",
        description: "Protect your note with a password. This will make it completely secure and unreadable without the password.",
        icon: Shield,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-100",
        submitText: "Encrypt Note",
        submitVariant: "default" as const
      };
    } else if (isDecrypt) {
      return {
        title: "🔓 Unlock Your Note",
        description: "Enter your password to decrypt and access your protected note.",
        icon: Key,
        iconColor: "text-green-600",
        iconBg: "bg-green-100",
        submitText: "Unlock Note",
        submitVariant: "default" as const
      };
    }
    return null;
  };

  const content = getModalContent();
  if (!content) return null;

  const IconComponent = content.icon;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className={`w-16 h-16 ${content.iconBg} rounded-full flex items-center justify-center`}>
              <IconComponent className={`w-8 h-8 ${content.iconColor}`} />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-gray-600 leading-relaxed">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEncrypt ? "Enter a strong password" : "Enter your password"}
                className="pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
                minLength={isEncrypt ? 6 : 1}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </Button>
            </div>
            {isEncrypt && (
              <p className="text-xs text-gray-500">
                Use at least 6 characters for security
              </p>
            )}
          </div>

          {/* Confirm Password Input (only for encryption) */}
          {isEncrypt && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="flex items-center space-x-2 text-xs">
                  {password === confirmPassword ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-green-600">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-red-600">Passwords don't match</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Security Notice for Encryption */}
          {isEncrypt && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-800 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Important Security Notice</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-xs text-amber-700">
                  • Your password cannot be recovered if forgotten<br/>
                  • Store it securely (password manager recommended)<br/>
                  • The note will be permanently encrypted
                </CardDescription>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={content.submitVariant}
              className="flex-1"
              disabled={
                isSubmitting || 
                !password || 
                (isEncrypt && (!confirmPassword || password !== confirmPassword))
              }
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              {content.submitText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
