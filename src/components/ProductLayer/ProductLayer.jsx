import { useRef, useEffect } from "react";
import { Group, Image } from "react-konva";

import useImage from "use-image";

/**
 * Non-interactive product overlay for AI-driven virtual try-on.
 * Position and size come from pose tracking (parent state).
 */
function ProductLayer({
  imageUrl,
  position = { x: 100, y: 100 },
  width: initialWidth = 200,
  height: initialHeight = 200,
}) {
  const shapeRef = useRef(null);
  const [image] = useImage(imageUrl, "anonymous");

  useEffect(() => {
    if (!shapeRef.current) return;
    const n = shapeRef.current;
    n.x(position.x);
    n.y(position.y);
    n.width(initialWidth);
    n.height(initialHeight);
    n.scaleX(1);
    n.scaleY(1);
    n.getLayer()?.batchDraw();
  }, [position.x, position.y, initialWidth, initialHeight]);

  if (!image) {
    return null;
  }

  return (
    <Group listening={false}>
      <Image
        ref={shapeRef}
        image={image}
        x={position.x}
        y={position.y}
        width={initialWidth}
        height={initialHeight}
        listening={false}
      />
    </Group>
  );
}

export default ProductLayer;
