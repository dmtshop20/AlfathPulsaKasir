import { useEffect, useRef } from 'react';

export const useBarcodeScanner = (onScan: (barcode: string) => void) => {
  const buffer = useRef<string>('');
  const lastKeyTime = useRef<number>(Date.now());
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const charList = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-';
      const currentTime = Date.now();
      
      if (currentTime - lastKeyTime.current > 50) {
        buffer.current = '';
      }

      if (e.key === 'Enter' && buffer.current.length > 3) {
        onScanRef.current(buffer.current);
        buffer.current = '';
      } else if (charList.includes(e.key)) {
        buffer.current += e.key;
      }

      lastKeyTime.current = currentTime;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
