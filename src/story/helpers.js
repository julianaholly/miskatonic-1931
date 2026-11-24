// Line helpers shared by the chapter files.
export const d = (text, extra) => ({ from: 'dyer', text, ...extra });                  // Dyer, live
export const h = (text, extra) => ({ from: 'dyer', text, tone: 'horror', ...extra });  // Dyer, when the sound gets in
export const sys = (text, extra) => ({ from: 'system', text, ...extra });             // the wireless set
