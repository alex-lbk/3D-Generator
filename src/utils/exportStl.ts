import * as THREE from 'three';

/**
 * Exports a THREE.BufferGeometry directly to a standard binary STL file.
 * Guaranteed millimeter units, closed binary header, triangle normals, and zero dependencies.
 */
export function exportGeometryToBinarySTL(geometry: THREE.BufferGeometry, filename: string = 'm4_hopup_einstellrad.stl'): void {
  // Ensure non-indexed triangles or index expanded
  const nonIndexed = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  const posAttr = nonIndexed.getAttribute('position');
  if (!posAttr) {
    throw new Error('Geometrie besitzt keine Positionsattribute.');
  }

  const numTriangles = posAttr.count / 3;
  const bufferLength = 84 + numTriangles * 50;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const dataView = new DataView(arrayBuffer);

  // 80-byte header
  const header = 'M4 Hop-Up Dial Generator - Parametric Archimedean Spiral CAD';
  for (let i = 0; i < 80; i++) {
    dataView.setUint8(i, i < header.length ? header.charCodeAt(i) : 0);
  }

  // Number of triangles (uint32 little endian)
  dataView.setUint32(80, numTriangles, true);

  let offset = 84;
  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const cb = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let i = 0; i < posAttr.count; i += 3) {
    vA.fromBufferAttribute(posAttr, i);
    vB.fromBufferAttribute(posAttr, i + 1);
    vC.fromBufferAttribute(posAttr, i + 2);

    // Compute facet normal
    cb.subVectors(vC, vB);
    ab.subVectors(vA, vB);
    normal.crossVectors(cb, ab).normalize();

    // Normal
    dataView.setFloat32(offset, normal.x, true);
    dataView.setFloat32(offset + 4, normal.y, true);
    dataView.setFloat32(offset + 8, normal.z, true);

    // Vertex 1
    dataView.setFloat32(offset + 12, vA.x, true);
    dataView.setFloat32(offset + 16, vA.y, true);
    dataView.setFloat32(offset + 20, vA.z, true);

    // Vertex 2
    dataView.setFloat32(offset + 24, vB.x, true);
    dataView.setFloat32(offset + 28, vB.y, true);
    dataView.setFloat32(offset + 32, vB.z, true);

    // Vertex 3
    dataView.setFloat32(offset + 36, vC.x, true);
    dataView.setFloat32(offset + 40, vC.y, true);
    dataView.setFloat32(offset + 44, vC.z, true);

    // Attribute byte count (0)
    dataView.setUint16(offset + 48, 0, true);

    offset += 50;
  }

  // Trigger download
  const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith('.stl') ? filename : `${filename}.stl`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);

  nonIndexed.dispose();
}
