-- Preserve the attributed source page while allowing direct audio/video clips
-- to play from the media element discovered by the Chrome side panel.
ALTER TABLE "Annotation" ADD COLUMN "mediaUrl" TEXT;
