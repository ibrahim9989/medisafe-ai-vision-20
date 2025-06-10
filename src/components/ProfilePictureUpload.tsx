
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null;
  onImageUpload: (url: string) => void;
  onImageRemove: () => void;
}

const ProfilePictureUpload = ({ currentImageUrl, onImageUpload, onImageRemove }: ProfilePictureUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      onImageUpload(publicUrl);
      
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully!",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!user || !currentImageUrl) return;

    try {
      // Extract filename from URL
      const fileName = `${user.id}/avatar.${currentImageUrl.split('.').pop()}`;
      
      const { error } = await supabase.storage
        .from('profile-pictures')
        .remove([fileName]);

      if (error) throw error;

      onImageRemove();
      
      toast({
        title: "Success",
        description: "Profile picture removed successfully!",
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Error",
        description: "Failed to remove profile picture.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-gray-700">Profile Picture (Optional)</Label>
      
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={currentImageUrl || ''} alt="Profile picture" />
          <AvatarFallback className="bg-gradient-to-br from-[#cb6ce6] to-[#9c4bc7] text-white text-lg">
            <Camera className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFileSelect}
              disabled={uploading}
              className="bg-white/60 backdrop-blur-sm border-white/30"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : currentImageUrl ? 'Change Picture' : 'Upload Picture'}
            </Button>
            
            {currentImageUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveImage}
                className="bg-white/60 backdrop-blur-sm border-white/30 text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          
          <p className="text-xs text-gray-500">
            JPG, PNG or GIF. Max file size 5MB.
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ProfilePictureUpload;
