// TODO: add license and attribution to png2svg
package convert

import (
	"floasis-items/flow/overflow/png2svg"
	"fmt"
	"io/ioutil"
	"math/rand"
	"strings"
	"time"
)

func init() {
	// Seed the random number generator
	rand.Seed(time.Now().UTC().UnixNano())
}

// Config contains the results of parsing the flags and arguments
type Config struct {
	inputFilename         string
	outputFilename        string
	colorPink             bool // color expanded rectangles pink
	limit                 bool // limit colors to a maximum of 4096 (#abcdef -> #ace)
	singlePixelRectangles bool // use only single pixel rectangles
	verbose               bool
}

func NewConfig(
	inputFilename string,
	outputFilename string,
	colorPink bool,
	limit bool,
	singlePixelRectangles bool,
	verbose bool,
) (*Config, string, error) {

	c := Config{
		inputFilename:         inputFilename,
		outputFilename:        outputFilename,
		colorPink:             colorPink,
		limit:                 limit,
		singlePixelRectangles: singlePixelRectangles,
		verbose:               verbose,
	}

	return &c, "", nil

}

func Convert(pngDirPath string, svgDirPath string) {

	files, _ := ioutil.ReadDir(pngDirPath)

	for _, file := range files {

		png_file_name := file.Name()
		svg_file_name := strings.Replace(png_file_name, "png", "svg", -1)

		png_file_path := fmt.Sprintf("%s/%s", pngDirPath, png_file_name)
		svg_file_path := fmt.Sprintf("%s/%s", svgDirPath, svg_file_name)

		_, err := ioutil.ReadFile(svg_file_path)
		if err != nil {
			fmt.Println("file at png path will be converted to SVG:", png_file_path)
			ConvertPNGtoSVG(png_file_path, svg_file_path)
		} else {
			fmt.Println("file at svg path exists and will not be converted to SVG:", svg_file_path)
		}

	}
}

// Run performs the user-selected operations
func ConvertPNGtoSVG(png_path string, svg_path string) error {

	var (
		box          *png2svg.Box
		x, y         int
		expanded     bool
		lastx, lasty int
		lastLine     int // one message per line / y coordinate
		done         bool
	)

	// c, quitMessage, err := NewConfigFromFlags()
	c, quitMessage, err := NewConfig(
		png_path,
		svg_path,
		false,
		false,
		false,
		true,
	)

	if err != nil {
		return err
	} else if quitMessage != "" {
		fmt.Println(quitMessage)
		return nil
	}

	img, err := png2svg.ReadPNG(c.inputFilename, c.verbose)
	if err != nil {
		return err
	}

	height := img.Bounds().Max.Y - img.Bounds().Min.Y

	pi := png2svg.NewPixelImage(img, c.verbose)
	pi.SetColorOptimize(c.limit)

	if c.verbose {
		fmt.Print("Placing rectangles... 0%")
	}

	percentage := 0
	lastPercentage := 0

	// Cover pixels by creating expanding rectangles, as long as there are uncovered pixels
	for !c.singlePixelRectangles && !done {

		// Select the first uncovered pixel, searching from the given coordinate
		x, y = pi.FirstUncovered(lastx, lasty)

		if c.verbose && y != lastLine {
			lastPercentage = percentage
			percentage = int((float64(y) / float64(height)) * 100.0)
			png2svg.Erase(len(fmt.Sprintf("%d%%", lastPercentage)))
			fmt.Printf("%d%%", percentage)
			lastLine = y
		}

		// Create a box at that location
		box = pi.CreateBox(x, y)
		// Expand the box to the right and downwards, until it can not expand anymore
		expanded = pi.Expand(box)

		// Use the expanded box. Color pink if it is > 1x1, and colorPink is true
		pi.CoverBox(box, expanded && c.colorPink, c.limit)

		// Check if we are done, searching from the current x,y
		done = pi.Done(x, y)
	}

	if c.verbose {
		png2svg.Erase(len(fmt.Sprintf("%d%%", lastPercentage)))
		fmt.Println("100%")
	}

	if c.singlePixelRectangles {
		// Cover all remaining pixels with rectangles of size 1x1
		pi.CoverAllPixels()
	}

	// Write the SVG image to outputFilename
	return pi.WriteSVG(c.outputFilename)
}
