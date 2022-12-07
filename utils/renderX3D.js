function renderX3D(THREE, x3dXml, scene, useImageTexture) {
  useImageTexture = useImageTexture === false ? false : true;
  scene = scene || new THREE.Scene();
  var defines = {};
  var float_pattern = /(\b|\-|\+)([\d\.e]+)/;
  var float2_pattern = /([\d\.\+\-e]+)\s+([\d\.\+\-e]+)/g;
  var float3_pattern = /([\d\.\+\-e]+)\s+([\d\.\+\-e]+)\s+([\d\.\+\-e]+)/g;

  /**
   * Interpolates colors a and b following their relative distance
   * expressed by t.
   *
   * @param float a
   * @param float b
   * @param float t
   * @returns {Color}
   */
  var interpolateColors = function (a, b, t) {
    var deltaR = a.r - b.r;
    var deltaG = a.g - b.g;
    var deltaB = a.b - b.b;

    var c = new THREE.Color();

    c.r = a.r - t * deltaR;
    c.g = a.g - t * deltaG;
    c.b = a.b - t * deltaB;

    return c;
  };

  /**
   * Vertically paints the faces interpolating between the
   * specified colors at the specified angels. This is used for the Background
   * node, but could be applied to other nodes with multiple faces as well.
   *
   * When used with the Background node, default is directionIsDown is true if
   * interpolating the skyColor down from the Zenith. When interpolationg up from
   * the Nadir i.e. interpolating the groundColor, the directionIsDown is false.
   *
   * The first angle is never specified, it is the Zenith (0 rad). Angles are specified
   * in radians. The geometry is thought a sphere, but could be anything. The color interpolation
   * is linear along the Y axis in any case.
   *
   * You must specify one more color than you have angles at the beginning of the colors array.
   * This is the color of the Zenith (the top of the shape).
   *
   * @param geometry
   * @param radius
   * @param angles
   * @param colors
   * @param boolean directionIsDown Whether to work bottom up or top down.
   */
  var paintFaces = function (
    geometry,
    radius,
    angles,
    colors,
    directionIsDown,
  ) {
    var f, n, p, vertexIndex, color;

    var direction = directionIsDown ? 1 : -1;

    var faceIndices = ['a', 'b', 'c', 'd'];

    var coord = [],
      aColor,
      bColor,
      t = 1,
      A = {},
      B = {},
      applyColor = false,
      colorIndex;

    for (var k = 0; k < angles.length; k++) {
      var vec = {};

      // push the vector at which the color changes
      vec.y = direction * (Math.cos(angles[k]) * radius);

      vec.x = direction * (Math.sin(angles[k]) * radius);

      coord.push(vec);
    }

    // painting the colors on the faces
    for (var i = 0; i < geometry.faces.length; i++) {
      f = geometry.faces[i];

      n = f instanceof THREE.Face3 ? 3 : 4;

      for (var j = 0; j < n; j++) {
        vertexIndex = f[faceIndices[j]];

        p = geometry.vertices[vertexIndex];

        for (var index = 0; index < colors.length; index++) {
          // linear interpolation between aColor and bColor, calculate proportion
          // A is previous point (angle)
          if (index === 0) {
            A.x = 0;
            A.y = directionIsDown ? radius : -1 * radius;
          } else {
            A.x = coord[index - 1].x;
            A.y = coord[index - 1].y;
          }

          // B is current point (angle)
          B = coord[index];

          if (undefined !== B) {
            // p has to be between the points A and B which we interpolate
            applyColor = directionIsDown
              ? p.y <= A.y && p.y > B.y
              : p.y >= A.y && p.y < B.y;

            if (applyColor) {
              bColor = colors[index + 1];

              aColor = colors[index];

              // below is simple linear interpolation
              t = Math.abs(p.y - A.y) / (A.y - B.y);

              // to make it faster, you can only calculate this if the y coord changes, the color is the same for points with the same y
              color = interpolateColors(aColor, bColor, t);

              f.vertexColors[j] = color;
            }
          } else if (undefined === f.vertexColors[j]) {
            colorIndex = directionIsDown ? colors.length - 1 : 0;
            f.vertexColors[j] = colors[colorIndex];
          }
        }
      }
    }
  };

  var renderNode = function (data, parent) {
    // console.log(data);

    if (/USE/.exec(data.string)) {
      var defineKey = /USE\s+?(\w+)/.exec(data.string)[1];

      if (undefined == defines[defineKey]) {
        console.warn(defineKey + ' is not defined.');
      } else {
        if (/appearance/.exec(data.string) && defineKey) {
          parent.material = defines[defineKey].clone();
        } else if (/geometry/.exec(data) && defineKey) {
          parent.geometry = defines[defineKey].clone();

          // the solid property is not cloned with clone(), is only needed for VRML loading, so we need to transfer it
          if (
            undefined !== defines[defineKey].solid &&
            defines[defineKey].solid === false
          ) {
            parent.geometry.solid = false;
            parent.material.side = THREE.DoubleSide;
          }
        } else if (defineKey) {
          var currentObject = defines[defineKey].clone();
          parent.add(currentObject);
        }
      }

      return;
    }

    var currentObject = parent;

    if ('viewpoint' === data.nodeType) {
      var p = data.position;
      parent.cameraPosition = { x: p.x, y: p.y, z: p.z };

      var r = data.orientation;
      // parent.cameraOrientation = { xyz: new THREE.Vector3(r.x, r.y, r.z), v: r.v };

      // parent.cameraFieldOfView = data.fieldOfView;
    } else if ('transform' === data.nodeType || 'group' === data.nodeType) {
      currentObject = new THREE.Object3D();

      if (/DEF/.exec(data.string)) {
        currentObject.name = /DEF\s+(\w+)/.exec(data.string)[1];
        defines[currentObject.name] = currentObject;
      }

      if (undefined !== data['translation']) {
        var t = data.translation;

        currentObject.position.set(t.x, t.y, t.z);
      }

      if (undefined !== data.rotation) {
        var r = data.rotation;

        currentObject.quaternion.setFromAxisAngle(
          new THREE.Vector3(r.x, r.y, r.z),
          r.w,
        );
      }

      if (undefined !== data.scale) {
        var s = data.scale;

        currentObject.scale.set(s.x, s.y, s.z);
      }

      parent.add(currentObject);
    } else if ('shape' === data.nodeType) {
      currentObject = new THREE.Mesh();

      if (/DEF/.exec(data.string)) {
        currentObject.name = /DEF\s+(\w+)/.exec(data.string)[1];

        defines[currentObject.name] = currentObject;
      }

      parent.add(currentObject);
    } else if ('background' === data.nodeType) {
      var segments = 20;

      // sky (full sphere):

      var radius = 2e4;

      var skyGeometry = new THREE.SphereGeometry(radius, segments, segments);
      var skyMaterial = new THREE.MeshBasicMaterial({
        fog: false,
        side: THREE.BackSide,
      });

      if (data.skyColor.length > 1) {
        paintFaces(skyGeometry, radius, data.skyAngle, data.skyColor, true);

        skyMaterial.vertexColors = THREE.VertexColors;
      } else {
        var color = data.skyColor[0];
        skyMaterial.color.setRGB(color.r, color.b, color.g);
      }

      scene.add(new THREE.Mesh(skyGeometry, skyMaterial));

      // ground (half sphere):

      if (data.groundColor !== undefined) {
        radius = 1.2e4;

        var groundGeometry = new THREE.SphereGeometry(
          radius,
          segments,
          segments,
          0,
          2 * Math.PI,
          0.5 * Math.PI,
          1.5 * Math.PI,
        );
        var groundMaterial = new THREE.MeshBasicMaterial({
          fog: false,
          side: THREE.BackSide,
          vertexColors: THREE.VertexColors,
        });

        paintFaces(
          groundGeometry,
          radius,
          data.groundAngle || [],
          data.groundColor,
          false,
        );

        scene.add(new THREE.Mesh(groundGeometry, groundMaterial));
      }
    } else if (/geometry/.exec(data.string)) {
      if ('box' === data.nodeType) {
        var s = data.size;
        if (s) {
          parent.geometry = new THREE.BoxGeometry(s.x, s.y, s.z);
        } else {
          parent.geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
        }
      } else if ('cylinder' === data.nodeType) {
        parent.geometry = new THREE.CylinderGeometry(
          data.radius,
          data.radius,
          data.height,
        );
      } else if ('cone' === data.nodeType) {
        parent.geometry = new THREE.CylinderGeometry(
          data.topRadius,
          data.bottomRadius,
          data.height,
        );
      } else if ('sphere' === data.nodeType) {
        parent.geometry = new THREE.SphereGeometry(data.radius);
      } else if (
        'indexedtriangleset' === data.nodeType ||
        'indexedtrianglestripset' === data.nodeType
      ) {
        var geometry = new THREE.Geometry();

        var indexes, uvIndexes, uvs, normals, colors;

        for (var i = 0, j = data.children.length; i < j; i++) {
          var child = data.children[i];

          var vec;

          if ('texturecoordinate' === child.nodeType) {
            uvs = child.points;
          }

          if ('normal' === child.nodeType) {
            uvs = child.points;
          }
          if ('"colorrgba"' === child.nodeType) {
            colors = child.colors;
          }

          if ('coordinate' === child.nodeType) {
            if (child.points) {
              for (var k = 0, l = child.points.length; k < l; k++) {
                var point = child.points[k];

                vec = new THREE.Vector3(point.x, point.y, point.z);

                geometry.vertices.push(vec);
              }
            }

            if (child.string.indexOf('DEF') > -1) {
              var name = /DEF\s+(\w+)/.exec(child.string)[1];

              defines[name] = geometry.vertices;
            }

            if (child.string.indexOf('USE') > -1) {
              var defineKey = /USE\s+(\w+)/.exec(child.string)[1];

              geometry.vertices = defines[defineKey];
            }
          }
        }

        var skip = 0;

        // some shapes only have vertices for use in other shapes
        if (data.index) {
          // read this: http://math.hws.edu/eck/cs424/notes2013/16_Threejs_Advanced.html
          for (var i = 0, j = data.index.length; i < j; i++) {
            indexes = data.index[i];
            //if ( data.texCoordIndex )
            //	uvIndexes = data.texCoordIndex[ i ];
            uvIndexes = data.index[i];

            // vrml support multipoint indexed face sets (more then 3 vertices). You must calculate the composing triangles here
            skip = 0;

            // Face3 only works with triangles, but IndexedFaceSet allows shapes with more then three vertices, build them of triangles
            while (indexes.length >= 3 && skip < indexes.length - 2) {
              var color = new THREE.Vector3(0, 0, 1);
              var face = new THREE.Face3(
                indexes[0],
                indexes[skip + (data.ccw ? 1 : 2)],
                indexes[skip + (data.ccw ? 2 : 1)],
              );
              if (uvs && uvIndexes) {
                geometry.faceVertexUvs[0].push([
                  new THREE.Vector2(uvs[uvIndexes[0]].x, uvs[uvIndexes[0]].y),
                  new THREE.Vector2(
                    uvs[uvIndexes[skip + (data.ccw ? 1 : 2)]].x,
                    uvs[uvIndexes[skip + (data.ccw ? 1 : 2)]].y,
                  ),
                  new THREE.Vector2(
                    uvs[uvIndexes[skip + (data.ccw ? 2 : 1)]].x,
                    uvs[uvIndexes[skip + (data.ccw ? 2 : 1)]].y,
                  ),
                ]);
              }

              skip++;

              geometry.faces.push(face);
            }
          }
        } else {
          // do not add dummy mesh to the scene
          parent.parent.remove(parent);
        }

        if (false === data.solid) {
          parent.material.side = THREE.DoubleSide;
        }

        // we need to store it on the geometry for use with defines
        geometry.solid = data.solid;

        geometry.computeFaceNormals();
        geometry.computeVertexNormals(); // does not show
        geometry.computeBoundingSphere();

        // see if it's a define
        if (/DEF/.exec(data.string)) {
          geometry.name = /DEF (\w+)/.exec(data.string)[1];
          defines[geometry.name] = geometry;
        }
        parent.geometry = geometry;
        //parent.geometry = geometry;
      }

      return;
    } else if (/appearance/.exec(data.string)) {
      for (var i = 0; i < data.children.length; i++) {
        var child = data.children[i];

        if ('material' === child.nodeType) {
          var material = new THREE.MeshPhongMaterial();

          if (undefined !== child.diffuseColor) {
            var d = child.diffuseColor;

            material.color.setRGB(d.r, d.g, d.b);
          }

          if (undefined !== child.emissiveColor) {
            var e = child.emissiveColor;

            material.emissive.setRGB(e.r, e.g, e.b);
          }

          if (undefined !== child.specularColor) {
            var s = child.specularColor;

            material.specular.setRGB(s.r, s.g, s.b);
          }

          if (undefined !== child.transparency) {
            var t = child.transparency;

            // transparency is opposite of opacity
            material.opacity = Math.abs(1 - t);

            material.transparent = true;
          }

          if (/DEF/.exec(data.string)) {
            material.name = /DEF (\w+)/.exec(data.string)[1];

            defines[material.name] = material;
          }

          parent.material = material;
        }

        if ('imagetexture' === child.nodeType && useImageTexture) {
          //var tex = THREE.ImageUtils.loadTexture("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABYSURBVDhPxc9BCsAgDERRj96j9WZpyI+CYxCKlL6VJfMXbfbSX8Ed8mOmAdMr8M5DNwVj2gJvaYqANXbBuoY0B4FbG1m7s592fh4Z7zx0GqCcog42vg7MHh1jhetTOqUmAAAAAElFTkSuQmCC");
          var tex = THREE.ImageUtils.loadTexture(child.url);
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;

          parent.material.map = tex;
        }
      }

      return;
    }

    for (var i = 0; i < data.children.length; i++) {
      var child = data.children[i];

      renderNode(data.children[i], currentObject);
    }
  };

  var getTree = function (x3dXml) {
    var tree = { string: 'scene', children: [] };

    for (var i = 0; i < x3dXml.documentElement.childNodes.length; i++) {
      if (x3dXml.documentElement.childNodes[i].nodeName === 'scene') {
        parseChildren(x3dXml.documentElement.childNodes[i], tree);
        return tree;
      }
    }
    console.error('Unable to find Scene element in X3D document');
  };

  var parseChildren = function (parentNode, parentResult) {
    for (var i = 0; i < parentNode.childNodes.length; i++) {
      var currentNode = parentNode.childNodes[i];
      if (currentNode.nodeType !== 3) {
        var nodeAttr = currentNode.attributes[0] || {};
        var newChild = {
          nodeType: currentNode.nodeName.toLocaleLowerCase(),
          string:
            getNodeGroup(currentNode.nodeName) +
            ' ' +
            currentNode.nodeName.toLocaleLowerCase() +
            ' ' +
            nodeAttr.nodeName +
            ' ' +
            nodeAttr.nodeValue,
          parent: parentResult,
          children: [],
        };
        parentResult.children.push(newChild);
        for (
          var attributesCounter = 0;
          attributesCounter < currentNode.attributes.length;
          attributesCounter++
        ) {
          parseAttribute(
            newChild,
            currentNode.attributes[attributesCounter].name,
            currentNode.attributes[attributesCounter].value,
          );
        }

        if (currentNode.childNodes.length > 0) {
          parseChildren(currentNode, newChild);
        }
      }
    }
  };

  var getNodeGroup = function (nodeName) {
    var group = null;

    switch (nodeName.toLowerCase()) {
      case 'box':
      case 'cylinder':
      case 'cone':
      case 'sphere':
      case 'indexedtrianglestripset':
      case 'indexedtriangleset':
        group = 'geometry';
        break;

      case 'material':
      case 'imagetexture':
        group = 'appearance';
        break;

      case 'coordinate':
        group = 'coord';
        break;

      default:
        //group = nodeName.toLowerCase();
        group = '';
        break;
    }

    return group;
  };

  var parseAttribute = function (node, attributeName, value) {
    var parts = [],
      part,
      property = {},
      fieldName,
      type;
    var valuePattern = /[^\s,\[\]]+/g;
    var point, index, angles, colors;

    fieldName = attributeName;
    type = node.nodeType;
    parts.push(attributeName);
    while (null != (part = valuePattern.exec(value))) {
      parts.push(part[0]);
    }

    var isRecordingFaces = false;
    var isRecordingPoints = false;
    var isRecordingAngles = false;
    var isRecordingColors = false;
    var recordingFieldname = false;
    var points;

    // trigger several recorders
    switch (fieldName) {
      case 'skyAngle':
      case 'groundAngle':
        recordingFieldname = fieldName;
        this.isRecordingAngles = true;
        this.angles = [];
        break;
      case 'skyColor':
      case 'color':
      case 'groundColor':
        recordingFieldname = fieldName;
        isRecordingColors = true;
        this.colors = [];
        break;
      case 'vector':
      case 'point':
        recordingFieldname = fieldName;
        isRecordingPoints = true;
        points = [];
        break;
      case 'coordIndex':
      case 'index':
      case 'texCoordIndex':
        recordingFieldname = fieldName;
        isRecordingFaces = true;
        this.useStrip = type == 'indexedtrianglestripset' ? true : false;
        this.indexes = [];
    }

    if (isRecordingFaces) {
      if (parts.length > 0) {
        index = [];
        parts = parts.splice(1);
        if (this.useStrip) {
          while (parts.length > 0) {
            var firstPart = parts;
            var endIndex = parts.indexOf('-1');
            firstPart = parts.splice(0, endIndex);
            //last part
            if (firstPart.length == 0) {
              firstPart = parts;
              parts = [];
            } else {
              parts.splice(0, 1);
            }
            var vertexCount = firstPart.length / 2;
            for (var j = 0; j < vertexCount - 1; j++) {
              var n = j * 2;
              this.indexes.push([
                firstPart[n],
                firstPart[n + 1],
                firstPart[n + 2],
              ]);
              this.indexes.push([
                firstPart[n + 2],
                firstPart[n + 1],
                firstPart[n + 3],
              ]);
            }
          }
        } else {
          for (var ind = 0; ind < parts.length; ind++) {
            // the part should either be positive integer or -1
            if (!/(-?\d+)/.test(parts[ind])) {
              continue;
            }
            index.push(parseInt(parts[ind]));
            if (index.length == 3) {
              if (index.length > 0) {
                this.indexes.push(index);
              }
              // start new one
              index = [];
            }
          }
        }
      }
      // this.indexes = index
      isRecordingFaces = false;
      node[recordingFieldname] = this.indexes;
    } else if (isRecordingPoints) {
      if (node.nodeType == 'coordinate') {
        while (null !== (parts = float3_pattern.exec(value))) {
          points.push({
            x: parseFloat(parts[1]),
            y: parseFloat(parts[2]),
            z: parseFloat(parts[3]),
          });
        }
      }

      if (node.nodeType == 'texturecoordinate') {
        while (null !== (parts = float2_pattern.exec(value))) {
          points.push({
            x: parseFloat(parts[1]),
            y: parseFloat(parts[2]),
          });
        }
      }

      if (node.nodeType == 'normal') {
        while (null !== (parts = float2_pattern.exec(value))) {
          this.points.push({
            x: parseFloat(parts[1]),
            y: parseFloat(parts[2]),
          });
        }
      }

      isRecordingPoints = false;
      node.points = points;
    } else if (isRecordingAngles) {
      if (parts.length > 0) {
        for (var ind = 0; ind < parts.length; ind++) {
          if (!float_pattern.test(parts[ind])) {
            continue;
          }

          this.angles.push(parseFloat(parts[ind]));
        }
      }

      this.isRecordingAngles = false;
      node[recordingFieldname] = this.angles;
    } else if (isRecordingColors) {
      while (null !== (parts = float3_pattern.exec(value))) {
        this.colors.push({
          r: parseFloat(parts[1]),
          g: parseFloat(parts[2]),
          b: parseFloat(parts[3]),
        });
      }

      isRecordingColors = false;
      node[recordingFieldname] = this.colors;
    } else if (parts[parts.length - 1] !== 'NULL' && fieldName !== 'children') {
      switch (fieldName) {
        case 'diffuseColor':
        case 'emissiveColor':
        case 'specularColor':
        case 'color':
          if (parts.length != 4) {
            console.warn('Invalid color format detected for ' + fieldName);
            break;
          }

          property = {
            r: parseFloat(parts[1]),
            g: parseFloat(parts[2]),
            b: parseFloat(parts[3]),
          };

          break;

        case 'translation':
        case 'scale':
        case 'size':
        case 'position':
          if (parts.length != 4) {
            console.warn('Invalid vector format detected for ' + fieldName);
            break;
          }

          property = {
            x: parseFloat(parts[1]),
            y: parseFloat(parts[2]),
            z: parseFloat(parts[3]),
          };

          break;

        case 'radius':
        case 'topRadius':
        case 'bottomRadius':
        case 'height':
        case 'transparency':
        case 'shininess':
        case 'ambientIntensity':
        case 'creaseAngle':
        case 'fieldOfView':
          if (parts.length != 2) {
            console.warn(
              'Invalid single float value specification detected for ' +
                fieldName,
            );
            break;
          }

          property = parseFloat(parts[1]);
          break;

        case 'rotation':
        case 'orientation':
          if (parts.length != 5) {
            console.warn('Invalid quaternion format detected for ' + fieldName);
            break;
          }

          property = {
            x: parseFloat(parts[1]),
            y: parseFloat(parts[2]),
            z: parseFloat(parts[3]),
            w: parseFloat(parts[4]),
          };
          break;

        case 'ccw':
        case 'solid':
        case 'colorPerVertex':
        case 'convex':
          if (parts.length != 2) {
            console.warn('Invalid format detected for ' + fieldName);
            break;
          }

          property = parts[1] === 'TRUE' ? true : false;
          break;

        case 'url':
          if (parts.length >= 3) {
            property = parts[1] + ',' + parts[2];
          } else {
            property = parts[1];
          }
          break;
      }

      node[fieldName] = property;
    }

    return property;
  };
  renderNode(getTree(x3dXml), scene);
}

module.exports = renderX3D;
