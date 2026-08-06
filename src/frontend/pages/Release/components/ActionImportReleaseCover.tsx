import type { ReleasePageParams } from '../type';
import { useImportReleaseCover } from 'frontend/services/api/mutations/library';
import { Button } from 'frontend/ui/Button';
import { Input } from 'frontend/ui/Input';
import { ImageUpIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRef } from 'react';

export const ActionImportReleaseCover = () => {
  const { releaseId } = useParams<ReleasePageParams>();
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: importReleaseCover } = useImportReleaseCover();

  return (
    <Button size="xs" title="Import cover" variant="tertiary">
      <ImageUpIcon onClick={() => inputRef.current?.click()} />
      <Input
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const formData = new FormData();
          const file = event.target.files?.[0];
          if (file) {
            formData.append('file', file);
            importReleaseCover({ formData, releaseId });
          }
        }}
        ref={inputRef}
        type="file"
      />
    </Button>
  );
};
