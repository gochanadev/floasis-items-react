// TODO: add license and attribution to png2svg
package png2svg

import (
	"bytes"
	"errors"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"math/rand"
	"os"
	"strconv"
	"strings"

	"github.com/xyproto/tinysvg"
)

// Pixel represents a pixel at position (x,y)
// with color (r,g,b,a)
// and a bool for if this pixel has been covered by an SVG shape yet
type Pixel struct {
	x       int
	y       int
	r       int
	g       int
	b       int
	a       int
	covered bool
}

// Box represents a box with the following properties:
// * position (x, y)
// * size (w, h)
// * color (r, g, b, a)
type Box struct {
	x, y       int
	w, h       int
	r, g, b, a int
}

// Pixels is a slice of pointers to Pixel
type Pixels []*Pixel

// PixelImage contains the data needed to convert a PNG to an SVG:
// pixels (with an overview of which pixels are covered) and
// an SVG document, starting with the document and root tag +
// colorOptimize, for if only 4096 colors should be used
// (short hex color strings, like #fff).
type PixelImage struct {
	pixels        Pixels
	document      *tinysvg.Document
	svgTag        *tinysvg.Tag
	verbose       bool
	w             int
	h             int
	colorOptimize bool
}

// SetColorOptimize can be used to set the colorOptimize flag,
// for using only 4096 colors.
func (pi *PixelImage) SetColorOptimize(enabled bool) {
	pi.colorOptimize = enabled
}

// ReadPNG tries to read the given PNG image filename and returns and image.Image
// and an error. If verbose is true, some basic information is printed to stdout.
func ReadPNG(filename string, verbose bool) (image.Image, error) {
	if verbose {
		fmt.Printf("Reading %s", filename)
		defer fmt.Println()
	}
	f, err := os.Open(filename)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	img, err := png.Decode(f)
	if err != nil {
		return nil, err
	}
	if verbose {
		fmt.Printf(" (%dx%d)", img.Bounds().Max.X-img.Bounds().Min.X, img.Bounds().Max.Y-img.Bounds().Min.Y)
	}
	return img, nil
}

// Erase characters on the terminal
func Erase(n int) {
	fmt.Print(strings.Repeat("\b", n))
}

// NewPixelImage initializes a new PixelImage struct,
// given an image.Image.
func NewPixelImage(img image.Image, verbose bool) *PixelImage {
	width := img.Bounds().Max.X - img.Bounds().Min.X
	height := img.Bounds().Max.Y - img.Bounds().Min.Y

	pixels := make(Pixels, width*height)

	var c color.NRGBA
	if verbose {
		fmt.Print("Interpreting image... 0%")
	}

	percentage := 0
	lastPercentage := 0
	i := 0
	lastLine := img.Bounds().Max.Y

	for y := img.Bounds().Min.Y; y < img.Bounds().Max.Y; y++ {

		if verbose && y != lastLine {
			lastPercentage = percentage
			percentage = int((float64(y) / float64(height)) * 100.0)
			Erase(len(fmt.Sprintf("%d%%", lastPercentage)))
			fmt.Printf("%d%%", percentage)
			lastLine = y
		}

		for x := img.Bounds().Min.X; x < img.Bounds().Max.X; x++ {
			c = color.NRGBAModel.Convert(img.At(x, y)).(color.NRGBA)
			alpha := int(c.A)
			// Mark transparent pixels as already being "covered"
			covered := alpha == 0
			pixels[i] = &Pixel{x, y, int(c.R), int(c.G), int(c.B), alpha, covered}
			i++
		}
	}

	// Create a new XML document with a new SVG tag
	document, svgTag := tinysvg.NewTinySVG(width, height)

	if verbose {
		Erase(len(fmt.Sprintf("%d%%", lastPercentage)))
		fmt.Println("100%")
	}

	return &PixelImage{pixels, document, svgTag, verbose, width, height, false}
}

// Done checks if all pixels are covered, in terms of being represented by an SVG element
// searches from the given x and y coordinate
func (pi *PixelImage) Done(startx, starty int) bool {
	for y := starty; y < pi.h; y++ {
		for x := startx; x < pi.w; x++ {
			i := y*pi.w + x
			if !pi.pixels[i].covered {
				return false
			}
		}
		// Start at the beginning of the line when searching the rest of the lines
		startx = 0
	}
	return true
}

// At returns the RGB color at the given coordinate
func (pi *PixelImage) At(x, y int) (r, g, b int) {
	i := y*pi.w + x
	//if i >= len(pi.pixels) {
	//	panic("At out of bounds, too large coordinate")
	//}
	p := *pi.pixels[i]
	return p.r, p.g, p.b
}

// At2 returns the RGBA color at the given coordinate
func (pi *PixelImage) At2(x, y int) (r, g, b, a int) {
	i := y*pi.w + x
	//if i >= len(pi.pixels) {
	//	panic("At out of bounds, too large coordinate")
	//}
	p := *pi.pixels[i]
	return p.r, p.g, p.b, p.a
}

// Covered returns true if the pixel at the given coordinate is already covered by SVG elements
func (pi *PixelImage) Covered(x, y int) bool {
	i := y*pi.w + x
	p := *pi.pixels[i]
	return p.covered
}

// CoverAllPixels will cover all pixels that are not yet covered by an SVG element
// , by creating a rectangle per pixel.
func (pi *PixelImage) CoverAllPixels() {
	coverCount := 0
	for _, p := range pi.pixels {
		if !(*p).covered {
			pi.svgTag.Pixel((*p).x, (*p).y, (*p).r, (*p).g, (*p).b)
			(*p).covered = true
			coverCount++
		}
	}
	if pi.verbose {
		fmt.Printf("Covered %d pixels with 1x1 rectangles.\n", coverCount)
	}
}

// FirstUncovered will find the first pixel that is not covered by an SVG element,
// starting from (startx,starty), searching row-wise, downwards.
func (pi *PixelImage) FirstUncovered(startx, starty int) (int, int) {
	for y := starty; y < pi.h; y++ {
		for x := startx; x < pi.w; x++ {
			i := y*pi.w + x
			if !pi.pixels[i].covered {
				return x, y
			}
		}
		// Start at the beginning of the line when searching the rest of the lines
		startx = 0
	}
	// This should never happen, except when debugging
	panic("All pixels are covered")
}

// TODO: investigate reason behind original package shortening colors, and why
// pure black is returned as '#000' instead of '#000000'
func lengthenBlack(hexColorBytes []byte, colorOptimize bool) []byte {
	if bytes.Equal(hexColorBytes, []byte("#000")) {
		return []byte("#000000")
	}
	// Return the unmodified color
	return hexColorBytes
}

// colorFromLine will extract the fill color from a svg rect line.
// "<rect ... fill="#ff0f00" ..." gives "#ff0f00".
// #ff0000 is shortened to  #f00.
// Returns false if no fill color is found.
// Returns an empty string if no fill color is found.
func colorFromLine(line []byte, colorOptimize bool) ([]byte, []byte, bool) {
	if !bytes.Contains(line, []byte(" fill=\"")) {
		return nil, nil, false
	}
	fields := bytes.Fields(line)
	for _, field := range fields {
		if bytes.HasPrefix(field, []byte("fill=")) {
			// assumption: there are always quotes, so that elems[1] exists
			elems := bytes.Split(field, []byte("\""))
			return elems[1], lengthenBlack(elems[1], colorOptimize), true
		}
	}
	// This should never happen
	return nil, nil, false
}

// groupLinesByFillColor will group lines that has a fill color by color, organized under <g> tags
// This is not the prettiest function, but it works.
// TODO: Rewrite, to make it prettier
// TODO: Benchmark
func groupLinesByFillColor(lines [][]byte, colorOptimize bool) [][]byte {
	// Group lines by fill color
	var (
		groupedLines                  = make(map[string][][]byte)
		fillColor, shortenedFillColor []byte
		found                         bool
	)
	for i, line := range lines {
		fillColor, shortenedFillColor, found = colorFromLine(line, colorOptimize)
		if !found {
			// skip
			continue
		}
		// Erase this line. The grouped lines will be inserted at the first empty line.
		lines[i] = make([]byte, 0)
		// TODO: Use the byte string as the key instead of converting to a string
		cs := string(shortenedFillColor)
		if _, ok := groupedLines[cs]; !ok {
			// Start an empty line
			groupedLines[cs] = make([][]byte, 0)
		}
		line = bytes.Replace(line, fillColor, shortenedFillColor, 1)
		line = append(line, '>')
		groupedLines[cs] = append(groupedLines[cs], line)
	}

	//for k, _ := range groupedLines {
	//	fmt.Println("COLOR: ", string(k))
	//}

	// Build a string of all lines with fillcolor, grouped by fillcolor, inside <g> tags
	var (
		buf  bytes.Buffer
		from []byte
	)
	for key, lines := range groupedLines {
		if len(lines) > 1 {
			buf.Write([]byte("<g fill=\""))
			//fmt.Printf("WRITING KEY %s\n", key)
			buf.WriteString(key)
			buf.Write([]byte("\">"))
			for _, line := range lines {
				from = append([]byte(" fill=\""), key...)
				buf.Write(bytes.Replace(line, append(from, '"'), []byte{}, 1))
			}
			buf.Write([]byte("</g>"))
		} else {
			buf.Write(lines[0])
		}
	}
	// Insert the contents in the first non-empty slice of lines
	for i, line := range lines {
		if len(line) == 0 {
			lines[i] = buf.Bytes()
			break
		}
	}
	// Return lines, some of them empty. One of them is a really long line with the above contents.
	return lines
}

// Bytes returns the rendered SVG document as bytes
func (pi *PixelImage) Bytes() []byte {
	if pi.verbose {
		fmt.Print("Rendering SVG...")
	}

	// Render the SVG document
	// TODO: pi.document.WriteTo also exists, and might be faster
	svgDocument := pi.document.Bytes()

	if pi.verbose {
		fmt.Println("ok")
		fmt.Print("Grouping elements by color...")
	}

	// TODO: Make the code related to grouping both faster and more readable

	// Group lines by fill color, insert <g> tags
	lines := bytes.Split(svgDocument, []byte(">"))
	lines = groupLinesByFillColor(lines, pi.colorOptimize)

	for i, line := range lines {
		if len(line) > 0 && !bytes.HasSuffix(line, []byte(">")) {
			lines[i] = append(line, '>')
		}
	}
	// Use the line contents as the new svgDocument
	svgDocument = bytes.Join(lines, []byte{})

	if pi.verbose {
		fmt.Println("ok")
		fmt.Print("Additional optimizations...")
	}

	// Only non-destructive and spec-conforming optimizations goes here

	// NOTE: Removing width and height for "1" gave incorrect results in GIMP.
	// NOTE: GIMP complains about the width and height not being set, but it is set.

	// Remove all newlines
	// Remove all spaces before closing tags
	// Remove double spaces
	// Remove empty x attributes
	// Remove empty y attributes
	// Remove empty width attributes
	// Remove empty height attributes
	// Remove single spaces between tags
	svgDocument = bytes.Replace(svgDocument, []byte("\n"), []byte{}, -1)
	svgDocument = bytes.Replace(svgDocument, []byte(" />"), []byte("/>"), -1)
	svgDocument = bytes.Replace(svgDocument, []byte("  "), []byte(" "), -1)
	svgDocument = bytes.Replace(svgDocument, []byte(" x=\"0\""), []byte{}, -1)
	svgDocument = bytes.Replace(svgDocument, []byte(" y=\"0\""), []byte{}, -1)
	svgDocument = bytes.Replace(svgDocument, []byte(" width=\"0\""), []byte{}, -1)
	svgDocument = bytes.Replace(svgDocument, []byte(" height=\"0\""), []byte{}, -1)
	svgDocument = bytes.Replace(svgDocument, []byte("> <"), []byte("><"), -1)

	// Replacement of colors that are not shortened, colors that has been shortened
	// and color names to even shorter strings.
	colorReplacements := map[string][]byte{
		"#f0ffff": []byte("azure"),
		"#f5f5dc": []byte("beige"),
		"#ffe4c4": []byte("bisque"),
		"#a52a2a": []byte("brown"),
		"#ff7f50": []byte("coral"),
		"#ffd700": []byte("gold"),
		"#808080": []byte("gray"), // "grey" is also possible
		"#008000": []byte("green"),
		"#4b0082": []byte("indigo"),
		"#fffff0": []byte("ivory"),
		"#f0e68c": []byte("khaki"),
		"#faf0e6": []byte("linen"),
		"#800000": []byte("maroon"),
		"#000080": []byte("navy"),
		"#808000": []byte("olive"),
		"#ffa500": []byte("orange"),
		"#da70d6": []byte("orchid"),
		"#cd853f": []byte("peru"),
		"#ffc0cb": []byte("pink"),
		"#dda0dd": []byte("plum"),
		"#800080": []byte("purple"),
		"#f00":    []byte("red"),
		"#fa8072": []byte("salmon"),
		"#a0522d": []byte("sienna"),
		"#c0c0c0": []byte("silver"),
		"#fffafa": []byte("snow"),
		"#d2b48c": []byte("tan"),
		"#008080": []byte("teal"),
		"#ff6347": []byte("tomato"),
		"#ee82ee": []byte("violet"),
		"#f5deb3": []byte("wheat"),
	}

	// Replace colors with the shorter version
	for k, v := range colorReplacements {
		svgDocument = bytes.Replace(svgDocument, []byte(k), v, -1)
	}

	if pi.verbose {
		fmt.Println("ok")
	}

	return svgDocument
}

// WriteSVG will save the current SVG document to a file
func (pi *PixelImage) WriteSVG(filename string) error {
	var (
		err error
		f   *os.File
	)

	if !pi.Done(0, 0) {
		return errors.New("the SVG representation does not cover all pixels")
	}
	if filename == "-" {
		f = os.Stdout
		// Turn off verbose messages, so that they don't end up in the SVG output
		pi.verbose = false
	} else {
		f, err = os.Create(filename)
		if err != nil {
			return err
		}
		defer f.Close()
	}

	// Write the generated SVG image to file or to stdout
	if _, err = f.Write(pi.Bytes()); err != nil {
		return err
	}
	return nil
}

// CreateRandomBox randomly searches for a place for a 1x1 size box.
// Note: If checkIfPossible is true, the function continue running until
// it either finds a free spot or no spots are available.
func (pi *PixelImage) CreateRandomBox(checkIfPossible bool) *Box {
	w := 1
	h := 1
	var x, y, r, g, b, a int
	for !checkIfPossible || !pi.Done(0, 0) {
		// Find a random placement for (x,y), for a box of size (1,1)
		x = rand.Intn(pi.w)
		y = rand.Intn(pi.h)
		if pi.verbose {
			fmt.Printf("Random box at (%d, %d)\n", x, y)
		}
		if pi.Covered(x, y) {
			continue
		}
		r, g, b, a = pi.At2(x, y)
		break
	}
	// Create a box at that placement, with width 1 and height 1
	// Return the box
	return &Box{x, y, w, h, r, g, b, a}
}

// CreateBox creates a 1x1 box at the given location, if it's not already covered
func (pi *PixelImage) CreateBox(x, y int) *Box {
	if pi.Covered(x, y) {
		panic("CreateBox at location that was already covered")
	}
	w, h := 1, 1
	r, g, b, a := pi.At2(x, y)
	// Create a box at that placement, with width 1 and height 1
	// Return the box
	return &Box{x, y, w, h, r, g, b, a}
}

// ExpandLeft will expand a box 1 pixel to the left,
// if all new pixels have the same color
func (pi *PixelImage) ExpandLeft(bo *Box) bool {
	// Loop from box top left (-1,0) to box bot left (-1,0)
	x := bo.x - 1
	if x <= 0 {
		return false
	}
	for y := bo.y; y < (bo.y + bo.h); y++ {
		r, g, b, a := pi.At2(x, y)
		if (r != bo.r) || (g != bo.g) || (b != bo.b) || (a != bo.a) {
			return false
		}
	}
	// Expand the box 1 pixel to the left
	bo.w++
	bo.x--
	return true
}

// ExpandUp will expand a box 1 pixel upwards,
// if all new pixels have the same color
func (pi *PixelImage) ExpandUp(bo *Box) bool {
	// Loop from box top left to box top right
	y := bo.y - 1
	if y <= 0 {
		return false
	}
	for x := bo.x; x < (bo.x + bo.w); x++ {
		r, g, b, a := pi.At2(x, y)
		if (r != bo.r) || (g != bo.g) || (b != bo.b) || (a != bo.a) {
			return false
		}
	}
	// Expand the box 1 pixel up
	bo.h++
	bo.y--
	return true
}

// ExpandRight will expand a box 1 pixel to the right,
// if all new pixels have the same color
func (pi *PixelImage) ExpandRight(bo *Box) bool {
	// Loop from box top right (+1,0) to box bot right (+1,0)
	x := bo.x + bo.w //+ 1
	if x >= pi.w {
		return false
	}
	for y := bo.y; y < (bo.y + bo.h); y++ {
		r, g, b, a := pi.At2(x, y)
		if (r != bo.r) || (g != bo.g) || (b != bo.b) || (a != bo.a) {
			return false
		}
	}
	// Expand the box 1 pixel to the right
	bo.w++
	return true
}

// ExpandDown will expand a box 1 pixel downwards,
// if all new pixels have the same color
func (pi *PixelImage) ExpandDown(bo *Box) bool {
	// Loop from box bot left to box bot right
	y := bo.y + bo.h //+ 1
	if y >= pi.h {
		return false
	}
	for x := bo.x; x < (bo.x + bo.w); x++ {
		r, g, b, a := pi.At2(x, y)
		if (r != bo.r) || (g != bo.g) || (b != bo.b) || (a != bo.a) {
			return false
		}
	}
	// Expand the box 1 pixel down
	bo.h++
	return true
}

// ExpandOnce tries to expand the box to the right and downwards, once
func (pi *PixelImage) ExpandOnce(bo *Box) bool {
	if pi.ExpandRight(bo) {
		return true
	}
	return pi.ExpandDown(bo)
}

// Expand tries to expand the box to the right and downwards, until it can't expand any more.
// Returns true if the box was expanded at least once.
func (pi *PixelImage) Expand(bo *Box) (expanded bool) {
	for {
		if !pi.ExpandOnce(bo) {
			break
		}
		expanded = true
	}
	return
}

// singleHex returns a single digit hex number, as a string
// the numbers are not rounded, just floored
func singleHex(x int) string {
	hex := strconv.FormatInt(int64(x), 16)
	if len(hex) == 1 {
		return "0"
	}
	return string(hex[0])
}

// shortColorString returns a string representing a color on the short form "#000"
func shortColorString(r, g, b int) string {
	return "#" + singleHex(r) + singleHex(g) + singleHex(b)
}

// CoverBox creates rectangles in the SVG image, and also marks the pixels as covered
// if pink is true, the rectangles will be pink
// if optimizeColors is true, the color strings will be shortened (and quantized)
func (pi *PixelImage) CoverBox(bo *Box, pink bool, optimizeColors bool) {
	// Draw the rectangle
	rect := pi.svgTag.AddRect(bo.x, bo.y, bo.w, bo.h)

	// Generate a fill color string
	var colorString string
	if pink {
		if optimizeColors {
			colorString = "#b38"
		} else {
			colorString = "#bb3388"
		}
	} else if optimizeColors {
		colorString = shortColorString(bo.r, bo.g, bo.b)
	} else {
		colorString = string(tinysvg.ColorBytes(bo.r, bo.g, bo.b))
	}

	// Set the fill color
	rect.Fill(colorString)

	// Mark all covered pixels in the PixelImage
	for y := bo.y; y < (bo.y + bo.h); y++ {
		for x := bo.x; x < (bo.x + bo.w); x++ {
			pi.pixels[y*pi.w+x].covered = true
		}
	}
}
