import { Button } from 'frontend/ui/Button';
import { Dialog } from 'frontend/ui/Dialog';
import { inputDefaultStyle } from 'frontend/ui/Input';
import { Link } from 'frontend/ui/Link';
import { CircleQuestionMarkIcon } from 'lucide-react';
import { useState } from 'react';

export const HelpDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="ml-auto" onClick={() => setOpen(true)} size="xs" variant="tertiary">
        <CircleQuestionMarkIcon />
      </Button>
      <Dialog className="gap-4" open={open} setOpen={setOpen}>
        <p>
          Search is powered by the
          {' '}
          <Link href="https://musicbrainz.org/doc/MusicBrainz_API">MusicBrainz API</Link>
          . For the
          official search syntax and field reference, see the
          {' '}
          <Link href="https://musicbrainz.org/doc/MusicBrainz_API/Search">
            search documentation
          </Link>
          .
        </p>
        <p>
          By default, any text you type searches release names. If you want to filter by another
          field, such as the artist, add a prefix like
          {' '}
          <span className="font-bold">artist:</span>
        </p>
        <p>Example:</p>
        <p className={inputDefaultStyle}>Meteora artist:Linkin Park</p>
        <p>
          This searches for releases named “Meteora” by the artist “Linkin Park”. Useful fields
          include: artist, reid (release ID), rgid (release group ID), and arid (artist ID).
        </p>
      </Dialog>
    </>
  );
};
