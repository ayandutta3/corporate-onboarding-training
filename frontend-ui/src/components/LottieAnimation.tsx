import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { Sparkles, AlertCircle } from 'lucide-react';

interface LottieAnimationProps {
  src?: string;
  animationData?: any;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  src,
  animationData,
  className = 'w-32 h-32',
  loop = true,
  autoplay = true,
}) => {
  const [data, setData] = useState<any>(animationData || null);
  const [loading, setLoading] = useState<boolean>(!animationData && !!src);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (animationData) {
      setData(animationData);
      setLoading(false);
      return;
    }

    if (!src) {
      setHasError(true);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setHasError(false);

    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Lottie fetch failed or offline mode:', err);
        if (isMounted) {
          setHasError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src, animationData]);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-indigo-500/10 rounded-2xl border border-indigo-500/20 animate-pulse`}>
        <Sparkles className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (hasError || !data) {
    return (
      <div className={`${className} flex flex-col items-center justify-center p-3 rounded-2xl bg-black/40 border border-white/10 text-center space-y-1`}>
        <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
        <span className="text-[10px] font-mono text-slate-400">Asset Loaded Offline</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <Lottie animationData={data} loop={loop} autoplay={autoplay} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
