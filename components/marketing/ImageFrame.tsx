import Image from 'next/image';

interface ImageFrameProps {
  src: string;
  alt: string;
  /** 'wide' for 16:9 banner, 'square' for 1:1, 'tall' for 3:4 */
  aspect?: 'wide' | 'square' | 'tall';
  /** true for above-the-fold images */
  priority?: boolean;
  className?: string;
}

const dimensionMap = {
  wide: { width: 1200, height: 675 },
  square: { width: 800, height: 800 },
  tall: { width: 800, height: 1067 },
};

export default function ImageFrame({
  src,
  alt,
  aspect = 'wide',
  priority = false,
  className = '',
}: ImageFrameProps) {
  const { width, height } = dimensionMap[aspect];

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="w-full h-auto object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 50vw"
      />
      {/* Brand overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#FF6A00]/20 to-transparent pointer-events-none" />
    </div>
  );
}
