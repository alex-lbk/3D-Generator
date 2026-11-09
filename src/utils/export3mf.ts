import JSZip from 'jszip';
import * as THREE from 'three';

/**
 * Exports a THREE.BufferGeometry to an industry-standard 3MF archive.
 * Follows 3MF Core Specification with unit="millimeter".
 */
export async function exportGeometryTo3MF(
  geometry: THREE.BufferGeometry,
  filename: string = 'm4_hopup_einstellrad.3mf'
): Promise<void> {
  const nonIndexed = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  const posAttr = nonIndexed.getAttribute('position');
  if (!posAttr) {
    throw new Error('Geometrie besitzt keine Positionsattribute.');
  }

  // Deduplicate vertices or write direct indexed map to keep 3MF file compact
  const vertexMap = new Map<string, number>();
  const vertices: { x: number; y: number; z: number }[] = [];
  const triangles: { v1: number; v2: number; v3: number }[] = [];

  const getVertexIndex = (x: number, y: number, z: number): number => {
    // 4 decimals precision (0.1 micron)
    const key = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;
    let idx = vertexMap.get(key);
    if (idx === undefined) {
      idx = vertices.length;
      vertexMap.set(key, idx);
      vertices.push({ x, y, z });
    }
    return idx;
  };

  const v = new THREE.Vector3();
  for (let i = 0; i < posAttr.count; i += 3) {
    v.fromBufferAttribute(posAttr, i);
    const v1 = getVertexIndex(v.x, v.y, v.z);

    v.fromBufferAttribute(posAttr, i + 1);
    const v2 = getVertexIndex(v.x, v.y, v.z);

    v.fromBufferAttribute(posAttr, i + 2);
    const v3 = getVertexIndex(v.x, v.y, v.z);

    // Only add non-degenerate triangles
    if (v1 !== v2 && v2 !== v3 && v3 !== v1) {
      triangles.push({ v1, v2, v3 });
    }
  }

  // Build model XML
  let verticesXml = '';
  for (let i = 0; i < vertices.length; i++) {
    const pt = vertices[i];
    verticesXml += `        <vertex x="${pt.x.toFixed(4)}" y="${pt.y.toFixed(4)}" z="${pt.z.toFixed(4)}" />\n`;
  }

  let trianglesXml = '';
  for (let i = 0; i < triangles.length; i++) {
    const t = triangles[i];
    trianglesXml += `        <triangle v1="${t.v1}" v2="${t.v2}" v3="${t.v3}" />\n`;
  }

  const modelXml = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <metadata name="Title">M4 Hop-Up Dial</metadata>
  <metadata name="Application">M4 Hop-Up Dial CAD Generator</metadata>
  <resources>
    <object id="1" type="model">
      <mesh>
        <vertices>
${verticesXml}        </vertices>
        <triangles>
${trianglesXml}        </triangles>
      </mesh>
    </object>
  </resources>
  <build>
    <item objectid="1" />
  </build>
</model>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>
</Relationships>`;

  // Create ZIP archive
  const zip = new JSZip();
  zip.file('[Content_Types].xml', contentTypesXml);
  zip.folder('_rels')?.file('.rels', relsXml);
  zip.folder('3D')?.file('3dmodel.model', modelXml);

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });

  // Trigger download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith('.3mf') ? filename : `${filename}.3mf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);

  nonIndexed.dispose();
}
