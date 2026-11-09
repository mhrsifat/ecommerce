import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function AppLogoIcon({
    className,
    alt = 'CSN Bangladesh Logo',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/csn-logo.png"
            alt={alt}
            className={cn('object-contain', className)}
            {...props}
        />
    );
}
