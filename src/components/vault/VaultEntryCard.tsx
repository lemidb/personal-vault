import { useState, useEffect } from 'react';
import { Key, FileText, Link2, CreditCard, Image, Eye, EyeOff, Copy, Trash2, ExternalLink, Loader2, Maximize2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getDecryptedFileUrl } from '@/api/storage';
import { supabase } from '@/integrations/supabase/client';
import type { DecryptedVaultEntry, PasswordData, NoteData, LinkData, ImageData } from '@/types/vault';
import { EditEntryDialog } from './EditEntryDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';


interface VaultEntryCardProps {
  entry: DecryptedVaultEntry;
  onDelete: (id: string, storagePath?: string) => void;
  isDeleting?: boolean;
}

const iconMap = {
  password: Key,
  note: FileText,
  link: Link2,
  transaction_screenshot: CreditCard,
  password_screenshot: Image,
  image: Image,
};

const colorMap = {
  password: 'text-vault-password',
  note: 'text-vault-note',
  link: 'text-vault-link',
  transaction_screenshot: 'text-vault-transaction',
  password_screenshot: 'text-vault-image',
  image: 'text-vault-image',
};

export const VaultEntryCard = ({ entry, onDelete, isDeleting }: VaultEntryCardProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const { toast } = useToast();
  const Icon = iconMap[entry.type];

  useEffect(() => {
    const loadImage = async () => {
      if (
        entry.storage_path &&
        (entry.type === 'image' ||
          entry.type === 'transaction_screenshot' ||
          entry.type === 'password_screenshot')
      ) {
        setIsImageLoading(true);
        try {
          const imageData = entry.data as ImageData;
          const url = await getDecryptedFileUrl(
            entry.user_id,
            entry.storage_path,
            imageData.mimeType || 'image/png'
          );
          setImageUrl(url);
        } catch (error) {
          console.error('Failed to load image:', error);
        } finally {
          setIsImageLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [entry]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  const renderContent = () => {
    switch (entry.type) {
      case 'password': {
        const data = entry.data as PasswordData;
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Username</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{data.username}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => copyToClipboard(data.username, 'Username')}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Password</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">
                  {showPassword ? data.password : '••••••••'}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => copyToClipboard(data.password, 'Password')}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            {data.url && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">URL</span>
                <a
                  href={data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {new URL(data.url).hostname}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        );
      }

      case 'note': {
        const data = entry.data as NoteData;
        return (
          <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
            {data.content}
          </p>
        );
      }

      case 'link': {
        const data = entry.data as LinkData;
        return (
          <div className="space-y-2">
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              {data.url}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            {data.description && (
              <p className="text-sm text-muted-foreground">{data.description}</p>
            )}
          </div>
        );
      }

      case 'image':
      case 'transaction_screenshot':
      case 'password_screenshot': {
        const data = entry.data as ImageData;
        return (
          <div className="space-y-3">
            {data.description && (
              <p className="text-sm text-muted-foreground">{data.description}</p>
            )}
            <div className="relative group rounded-lg border border-border overflow-hidden bg-secondary/30 min-h-[160px] flex items-center justify-center">
              {isImageLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground italic">Decrypting...</span>
                </div>
              ) : imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt={entry.title}
                    className="w-full h-40 object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {/* TODO: Add a dialog to view the full image */}
                    <ViewImageDialog imageUrl={imageUrl} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Image className="h-8 w-8 opacity-20" />
                  <span className="text-xs">Image unavailable</span>
                </div>
              )}
            </div>
          </div>
        );
      }

      default:
        return (
          <p className="text-sm text-muted-foreground">
            {entry.storage_path ? 'Encrypted file stored' : 'No content'}
          </p>
        );
    }
  };

  return (
    <Card className="entry-card animate-entry">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('rounded-lg bg-secondary p-2', colorMap[entry.type])}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-medium leading-none">{entry.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(entry.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <EditEntryDialog entry={entry} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete entry?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The entry will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(entry.id, entry.storage_path || undefined)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
        {entry.tags && entry.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};



function ViewImageDialog({ imageUrl }: { imageUrl: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2">
          <Maximize2 className="h-4 w-4" />
          View Full
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl w-[90vw] p-0 overflow-hidden bg-background/95 backdrop-blur-sm">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>View Image</DialogTitle>
          <DialogDescription>
            View the maximized image
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-4 min-h-[50vh]">
          <img
            src={imageUrl}
            alt="Full view"
            className="max-w-full max-h-[70vh] object-contain rounded-md shadow-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}   