import React, { useState, useRef, useEffect } from "react";

const WheelPicker = ({
  options,
  value,
  onChange,
  unit = "",
  visibleItems = 5,
  itemHeight = 40,
}) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startScrollTop, setStartScrollTop] = useState(0);
  const containerHeight = visibleItems * itemHeight;
  const paddingTop = (containerHeight - itemHeight) / 2;
  const paddingBottom = (containerHeight - itemHeight) / 2;

  // Set initial scroll position
  useEffect(() => {
    if (containerRef.current) {
      const selectedIndex = options.indexOf(value);
      if (selectedIndex !== -1) {
        containerRef.current.scrollTop = selectedIndex * itemHeight;
      }
    }
  }, [value, options, itemHeight]);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setStartScrollTop(containerRef.current.scrollTop);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartScrollTop(containerRef.current.scrollTop);
    e.preventDefault();
  };

  const handleMove = (clientY) => {
    if (!isDragging || !containerRef.current) return;

    const deltaY = clientY - startY;
    containerRef.current.scrollTop = startScrollTop - deltaY;
  };

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientY);
  };

  const handleMouseMove = (e) => {
    handleMove(e.clientY);
  };

  const handleEnd = () => {
    if (!isDragging || !containerRef.current) return;

    setIsDragging(false);
    const scrollTop = containerRef.current.scrollTop;
    const selectedIndex = Math.round(scrollTop / itemHeight);

    // Ensure index is within bounds
    const clampedIndex = Math.max(
      0,
      Math.min(options.length - 1, selectedIndex)
    );

    onChange(options[clampedIndex]);

    // Snap to position
    containerRef.current.scrollTo({
      top: clampedIndex * itemHeight,
      behavior: "smooth",
    });
  };

  // Calculate which item is at the center
  const getCenterIndex = () => {
    if (!containerRef.current) return -1;
    const scrollTop = containerRef.current.scrollTop;
    return Math.round(scrollTop / itemHeight);
  };

  const centerIndex = getCenterIndex();

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="overflow-hidden relative scrollbar-hide"
        style={{ height: containerHeight }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}>
        <div
          style={{
            paddingTop,
            paddingBottom,
          }}>
          {options.map((option, index) => {
            const distance = Math.abs(index - centerIndex);
            const scale = 1 - Math.min(distance * 0.1, 0.3);
            const opacity = 1 - Math.min(distance * 0.3, 0.7);
            const fontWeight = distance === 0 ? "bold" : "normal";

            return (
              <div
                key={option}
                className={`flex items-center justify-center transition-all duration-200 ${
                  distance === 0 ? "text-white" : "text-[#818384]"
                }`}
                style={{
                  height: itemHeight,
                  transform: `scale(${scale})`,
                  opacity,
                  fontWeight,
                }}>
                {option}
                {unit && distance === 0 && (
                  <span className="ml-1 text-[#818384] text-sm">{unit}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Selection indicator lines */}
        <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 pointer-events-none">
          <div className="border-t border-[#AD49E1]"></div>
          <div className="border-b border-[#AD49E1] mt-[calc(40px-1px)]"></div>
        </div>
      </div>

      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#0A0A0A] to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none"></div>
    </div>
  );
};

export default WheelPicker;
