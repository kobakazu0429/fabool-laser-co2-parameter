function ptToTextHeightMm(pt) {
  return 0.71875 * pt;
}
function ptToTextWidthMm(pt) {
  return 0.4951 * pt;
}

function genId({ prefix, power, speed }) {
  return [prefix, power, speed].filter(Boolean).join("-");
}

function genRectSymbol({ power, speed, times, id }) {
  const symbol = `
    <symbol times="${times}" rasterDpi="254" enable="1" imagedata-type="vectorStroke" laserPower="${power}" headSpeed="${speed}" id="${id}" name="四角形" hatch="horizontal(0.50)">
      <g>
        <path stroke="#567193" d="M0,0H100a100,100,0,0,1,-100,100Z" fill="none"/>
      </g>
    </symbol>
    `.trim();
  // const symbol = `
  //   <symbol times="${times}" rasterDpi="254" enable="1" imagedata-type="vectorStroke" laserPower="${power}" headSpeed="${speed}" id="${id}" name="四角形" hatch="horizontal(0.50)">
  //     <g>
  //       <path stroke="#567193" d="M0,0L100,0L100,100L0,100L0,0" fill="none"/>
  //     </g>
  //   </symbol>
  //   `.trim();
  return symbol;
}

/**
 * @param {Object} data
 * @param {string} data.fontSize
 */
function genTextSymbol({
  power,
  speed,
  times,
  id,
  text,
  hatching,
  fontSize,
}) {
  const symbol = `
    <symbol times="${times}" rasterDpi="254" enable="1" imagedata-type="text" laserPower="${power}" headSpeed="${speed}" id="${id}" name="" hatch="horizontal(${hatching})">
      <g>
        <text x="0" y="${fontSize}" font-family="Arial" stroke="#333333" font-style="Regular" font-weight="Regular" font-size="${fontSize}">${text}</text>
      </g>
    </symbol>
    `.trim();
  return symbol;
}

/**
 * size: [cm]
 */
function genUse({ id, left, top, size, y = 0 }) {
  const use = `<use rotatedAngle="0" y="${y}" transform="matrix(${size},0,0,${size},${left},${top})" xlink:href="#${id}"/>`;
  return use;
}

function genSvg({ powers, speeds, fontPower,
  fontSpeed,
  fontSizeAsPt,
  margin,
  leftMargin,
  topMargin,
  times,
  size }) {
  // const fontPower = document.getElementById("font_power").valueAsNumber;
  // const fontSpeed = document.getElementById("font_speed").valueAsNumber;
  // const fontSizeAsPt = document.getElementById("font_size").valueAsNumber;

  // const margin = document.getElementById("margin").valueAsNumber;
  // const leftMargin = margin + ptToTextWidthMm(fontSizeAsPt) * 4 + margin;
  // const topMargin = margin + ptToTextHeightMm(fontSizeAsPt) + margin;

  // const times = document.getElementById("times").valueAsNumber;
  // const size = document.getElementById("size").valueAsNumber;

  const data = `
  <?xml version="1.0" encoding="utf-8"?>
  <project updated="2022/05/13 16:14:08" version="1.0" name="untitled" created="2022/05/13 16:13:40">
   <machine laser="FABOOL_CO2L_FDS" type="FaboolLaserDS"/>
   <settings>
    <workarea width="1050" height="630"/>
    <driverPower y="980" x="400"/>
   </settings>
   <svg y="0px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" xml:space="preserve" version="1.2" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px">
    <defs>
     ${powers
      .map((power) => {
        return speeds.map((speed) => {
          return genRectSymbol({
            power,
            speed,
            times,
            id: genId({ prefix: "rect", power, speed }),
          });
        });
      })
      .flat()
      .join("\n")}

       ${powers
      .map((power, row) => {
        return genTextSymbol({
          id: genId({ prefix: "text", power }),
          power: fontPower,
          speed: fontSpeed,
          times: 1,
          y: -1 * fontSizeAsPt,
          hatching: 0.1,
          text: power,
          fontSize: fontSizeAsPt,
        });
      })
      .join("\n")}
      ${speeds
      .map((speed, column) => {
        return genTextSymbol({
          id: genId({ prefix: "text", speed }),
          power: fontPower,
          speed: fontSpeed,
          times: 1,
          y: -1 * fontSizeAsPt,
          hatching: 0.1,
          text: speed,
          fontSize: fontSizeAsPt,
        });
      })
      .join("\n")}
    </defs>
    ${powers
      .map((power, row) => {
        return speeds.map((speed, column) => {
          return genUse({
            id: genId({ prefix: "rect", power, speed }),
            left: (size + margin) * row + leftMargin,
            top: (size + margin) * column + topMargin,
            size: size / 100,
          });
        });
      })
      .flat()
      .join("\n")}

      ${powers
      .map((power, row) => {
        return genUse({
          id: genId({ prefix: "text", power }),
          left:
            (size + margin) * row +
            leftMargin +
            size / 2 -
            ptToTextWidthMm(fontSizeAsPt),
          top: ptToTextHeightMm(fontSizeAsPt) + margin,
          size: 1,
          y: -1 * fontSizeAsPt,
        });
      })
      .join("\n")}
      ${speeds
      .map((speed, column) => {
        return genUse({
          id: genId({ prefix: "text", speed }),
          left: margin,
          top:
            (size + margin) * column +
            topMargin +
            size / 2 +
            ptToTextHeightMm(fontSizeAsPt) / 2,
          size: 1,
          y: -1 * fontSizeAsPt,
        });
      })
      .join("\n")}
   </svg>
  </project>
  `.trim();
  return data;
}


onmessage = (e) => {
  // console.log('Message received from main script');
  // console.log(e);
  // var workerResult = 'Result: ' + e.data[0] + e.data[1];
  // console.log('Posting message back to main script');
  const svg = genSvg(e.data)
  postMessage(svg);
}
