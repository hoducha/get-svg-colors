const fs = require('fs')
const cheerio = require('cheerio')
const isSVG = require('is-svg')
const uniq = require('lodash.uniq')
const compact = require('lodash.compact')
const chroma = require('chroma-js')
const hexy = /^#[0-9a-f]{3,6}$/i

const isColorString = (str) => {
  if (!str) return false
  if (str === 'none') return false
  return (str.length === 4 || str.length === 7) && str.match(hexy)
}

const color = (str) => {
  return isColorString(str) ? chroma(str) : null
}

module.exports = function getSvgColors(input, options) {

  if (!isSVG(input)) {
    input = fs.readFileSync(input, 'utf8')
  }

  const $ = cheerio.load(input)

  // Find elements with a `fill` attribute
  var fills = $('[fill]').map(function (i, el) {
    return color($(this).attr('fill'))
  }).get()

  // Find elements with a `stroke` attribute
  var strokes = $('[stroke]').map(function (i, el) {
    return color($(this).attr('stroke'))
  }).get()

  // Find `fill` and `stroke` within inline styles
  $('[style]').each(function (i, el) {
    fills.push(color($(this).css('fill')))
    strokes.push(color($(this).css('stroke')))
  })

  // Find elements with a `stop-color` attribute (gradients)
  var stops = $('[stop-color]').map(function (i, el) {
    return color($(this).attr('stop-color'))
  }).get()

  if (options && options.flat) {
    return compact(uniq(fills.concat(strokes).concat(stops)))
  }

  return {
    fills: compact(uniq(fills)),
    strokes: compact(uniq(strokes)),
    stops: compact(uniq(stops))
  }

}
