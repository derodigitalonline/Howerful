import { useState, useRef } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { useUploadProfilePicture } from '@/hooks/useSupabaseProfile';
import { Button } from '@/components/ui/button';

interface ProfilePictureUploadProps {
  currentPictureUrl?: string;
  userName?: string;
  onUploadSuccess?: (url: string) => void;
}

export default function ProfilePictureUpload({
  currentPictureUrl,
  userName = 'User',
  onUploadSuccess,
}: ProfilePictureUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPictureUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadProfilePicture();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (1MB max)
    const MAX_SIZE = 1 * 1024 * 1024; // 1MB in bytes
    if (file.size > MAX_SIZE) {
      toast.error('File too large', {
        description: 'Profile picture must be less than 1MB',
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please select an image file',
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase
    uploadMutation.mutate(file, {
      onSuccess: (url) => {
        toast.success('Profile picture updated!');
        onUploadSuccess?.(url);
      },
      onError: (error: any) => {
        toast.error('Upload failed', {
          description: error.message || 'Failed to upload profile picture',
        });
        // Reset preview on error
        setPreviewUrl(currentPictureUrl || null);
      },
    });
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const userInitial = userName[0]?.toUpperCase() || 'U';

  return (
    <div className="relative group">
      {/* Profile Picture Display */}
      <div
        className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-chart-2/20 border-4 border-primary/30 flex items-center justify-center cursor-pointer transition-all hover:ring-4 hover:ring-primary/50"
        onClick={handleClick}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`${userName}'s profile`}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-12 h-12 text-primary" />
        )}

        {/* Upload Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
          {uploadMutation.isPending ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploadMutation.isPending}
      />

      {/* Upload Button (Mobile-friendly) */}
      <Button
        size="icon"
        variant="secondary"
        className="absolute bottom-0 right-0 rounded-full w-8 h-8 shadow-lg"
        onClick={handleClick}
        disabled={uploadMutation.isPending}
      >
        {uploadMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Camera className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
