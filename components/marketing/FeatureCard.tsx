import Link from 'next/link';
import Badge from './Badge';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  badge?: string;
}

export default function FeatureCard({ title, description, icon, href, badge }: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 p-5 bg-white border border-[#EAEAEA] rounded-xl hover:border-[#FF6A00]/40 hover:shadow-md transition-all group h-full"
    >
      <span className="text-2xl shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-[#111] group-hover:text-[#FF6A00] transition-colors line-clamp-1">{title}</h3>
          {badge && <Badge>{badge}</Badge>}
        </div>
        <p className="text-sm text-[#666] leading-relaxed line-clamp-3">{description}</p>
      </div>
    </Link>
  );
}
