/*
Encapsulates various automation tasks used in go testing and setup scripts.
*/

package svg_prep

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"

	"github.com/JoshVarga/svgparser"
	"github.com/onflow/cadence"
)

// https://stackoverflow.com/questions/39868029/how-to-generate-a-sequence-of-numbers
func MakeRange(min, max int) []int {
	a := make([]int, max-min+1)
	for i := range a {
		a[i] = min + i
	}
	return a
}

func getGElemStruct(deployer_address string, attributes cadence.Struct, children cadence.Array) cadence.Struct {
	gSvgChildStruct := cadence.Struct{
		Fields: []cadence.Value{cadence.String("g"), cadence.String("element"), cadence.String(""), attributes, children},
		StructType: &cadence.StructType{
			QualifiedIdentifier: "A." + deployer_address + ".IaNFTAnalogs.GElem",
			Fields: []cadence.Field{{
				Identifier: "name",
				Type:       cadence.StringType{},
			}, {
				Identifier: "type",
				Type:       cadence.StringType{},
			}, {
				Identifier: "value",
				Type:       cadence.StringType{},
			}, {
				Identifier: "attributes",
				Type:       &cadence.StructType{},
			}, {
				Identifier: "children",
				Type: cadence.VariableSizedArrayType{
					ElementType: &cadence.StructType{},
				},
			}},
		},
	}
	return gSvgChildStruct
}

func getGElemAttributesStruct(deployer_address string, fill string) cadence.Struct {
	gSvgChildAttributesStruct := cadence.Struct{
		Fields: []cadence.Value{cadence.String(fill)},
		StructType: &cadence.StructType{
			QualifiedIdentifier: "A." + deployer_address + ".IaNFTAnalogs.GElemAttributes",
			Fields: []cadence.Field{{
				Identifier: "fill",
				Type:       cadence.StringType{},
			}},
		},
	}
	return gSvgChildAttributesStruct
}

func getRectStruct(deployer_address string, name string, rectType string, value string, attributes cadence.Struct) cadence.Struct {
	rectSvgChildStruct := cadence.Struct{
		Fields: []cadence.Value{cadence.String(name), cadence.String(rectType), cadence.String(value), attributes},
		StructType: &cadence.StructType{
			QualifiedIdentifier: "A." + deployer_address + ".IaNFTAnalogs.Rect",
			Fields: []cadence.Field{{
				Identifier: "name",
				Type:       cadence.StringType{},
			}, {
				Identifier: "type",
				Type:       cadence.StringType{},
			}, {
				Identifier: "value",
				Type:       cadence.StringType{},
			}, {
				Identifier: "attributes",
				Type:       &cadence.StructType{},
			}},
		},
	}
	return rectSvgChildStruct
}

func getRectAttributesStruct(deployer_address string, x string, y string, width string, height string) cadence.Struct {
	rectAttributesStruct := cadence.Struct{
		Fields: []cadence.Value{cadence.String(x), cadence.String(y), cadence.String(width), cadence.String(height)},
		StructType: &cadence.StructType{
			QualifiedIdentifier: "A." + deployer_address + ".IaNFTAnalogs.RectAttributes",
			Fields: []cadence.Field{{
				Identifier: "x",
				Type:       cadence.StringType{},
			}, {
				Identifier: "y",
				Type:       cadence.StringType{},
			}, {
				Identifier: "width",
				Type:       cadence.StringType{},
			}, {
				Identifier: "height",
				Type:       cadence.StringType{},
			}},
		},
	}
	return rectAttributesStruct
}

// func GetSvgStruct(svgString string, metaDataString []string) cadence.Struct {
func GetSvgStruct(svgString string, flowNetwork string) cadence.Struct {
	// fmt.Println("META DAT STRING FROM GET SNVG STRUC:", metaDataString)

	err := godotenv.Load(".env.local")
	if err != nil {
		log.Fatal("Error in svg_prep.go when loading .env.local file")
	}

	var deployer_address string

	if flowNetwork == "emulator" || flowNetwork == "embedded" {
		full_deployer_address := os.Getenv("NEXT_PUBLIC_FLOASIS_NFT_DEPLOYER_ADDRESS_EMULATOR")
		deployer_address = full_deployer_address[2:]
	} else if flowNetwork == "testnet" {
		full_deployer_address := os.Getenv("NEXT_PUBLIC_FLOASIS_NFT_DEPLOYER_ADDRESS_TESTNET")
		deployer_address = full_deployer_address[2:]
	} else {
		full_deployer_address := os.Getenv("NEXT_PUBLIC_FLOASIS_NFT_DEPLOYER_ADDRESS_MAINNET")
		deployer_address = full_deployer_address[2:]
	}

	// CREATE READER FOR THE SVG STRING
	reader := strings.NewReader(svgString)

	// CREATE THE PARSER ELEMENT FROM THE SVG READER
	// https://github.com/JoshVarga/svgparser/blob/5eaba627a7d11a384dde3802ac251442e14d87ef/parser.go#L22
	parentParserElement, _ := svgparser.Parse(reader, false)

	// PULL OUT A MAP OF THE PARENT SVG'S ATTRIBUTES
	parentElementAttributes := parentParserElement.Attributes

	// PULL OUT THE PARSER ELEMENT FOR THE CHILDREN OF THE SVG PARENT ELEMENT
	childrenParserElement := parentParserElement.Children
	// fmt.Println(reflect.TypeOf(childrenParserElement))

	// // inspect
	// // https: //stackoverflow.com/questions/27117896/how-to-pretty-print-variables
	// a, err := json.MarshalIndent(parentParserElement, "", "  ")
	// if err != nil {
	// 	fmt.Println("error:", err)
	// }
	// fmt.Println("parentParserElement: #####################")
	// fmt.Print(string(a))

	// MAKE A SINGLE ATTRIBUTES STRUCT FOR THE PARENT SVG
	svgAttributesStruct := cadence.Struct{
		// style attribute uses 'shape-rendering' attribute added to correct browser anti-aliazing issue
		// (lines showing up at different resize values for svg)
		Fields: []cadence.Value{
			cadence.String(parentElementAttributes["width"]),
			cadence.String(parentElementAttributes["height"]),
			cadence.String(parentElementAttributes["baseProfile"]),
			cadence.String(parentElementAttributes["version"]),
			cadence.String(parentElementAttributes["viewBox"]),
			cadence.String(parentElementAttributes["xmlns"]),
			cadence.String("shape-rendering:crispEdges"),
		},
		StructType: &cadence.StructType{
			QualifiedIdentifier: "A." + deployer_address + ".IaNFTAnalogs.SvgAttributes",
			Fields: []cadence.Field{{
				Identifier: "width",
				Type:       cadence.StringType{},
			}, {
				Identifier: "height",
				Type:       cadence.StringType{},
			}, {
				Identifier: "baseProfile",
				Type:       cadence.StringType{},
			}, {
				Identifier: "version",
				Type:       cadence.StringType{},
			}, {
				Identifier: "viewBox",
				Type:       cadence.StringType{},
			}, {
				Identifier: "xmlns",
				Type:       cadence.StringType{},
			}, {
				Identifier: "style",
				Type:       cadence.StringType{},
			}},
		},
	}

	// slice of g structs
	cadenceStructSlice := []cadence.Value{}

	// ITERATE OVER THE PARENT PARSER ELEMENT'S CHILDREN
	for _, svgChildParserElem := range childrenParserElement {
		// fmt.Println("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  G PARSER PARSER ELEM $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
		// fmt.Println(svgChildParserElem.Name)

		childElemName := svgChildParserElem.Name

		if childElemName == "g" {

			childElemChildren := svgChildParserElem.Children

			// slice of rect structs
			rectStructSlice := []cadence.Value{}

			// iterate over each rect parser element child from the g parser element
			for _, rectParserElem := range childElemChildren {
				// fmt.Println("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  RECT PARSER ELEM $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
				// fmt.Println(rectParserElem)

				// pull out the attributes for each rect
				rectAttr := rectParserElem.Attributes

				// create a new rect attributes struct
				rectAttributesStruct := getRectAttributesStruct(deployer_address, rectAttr["x"], rectAttr["y"], rectAttr["width"], rectAttr["height"])

				// create a new rect struct
				rectStruct := getRectStruct(deployer_address, "rect", "type", "value", rectAttributesStruct)

				// append the slice of rect structs
				rectStructSlice = append(rectStructSlice, rectStruct)
			}

			// create the cadence array of rect structs
			rectStructArray := cadence.NewArray(rectStructSlice)

			// create the g attributes struct
			// if svgChildParserElem's 'fill' attribute's value is absent, an empty string will be resolved and created for the gSvgChildAttributesStruct
			// for 'rect' element, default value is black: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill#rect
			// so empty string as the 'fill' color will render as black.
			// the svg scour library appears to leave the 'fill' attribute out for black elements
			gAttributes := getGElemAttributesStruct(deployer_address, svgChildParserElem.Attributes["fill"])

			// create the g struct
			gStruct := getGElemStruct(deployer_address, gAttributes, rectStructArray)

			// add the g struct to the cadenve struct slice just outside of this scope
			cadenceStructSlice = append(cadenceStructSlice, gStruct)
		} else if childElemName == "rect" { // some svgs may come in with orphaned rect elements
			// fmt.Println("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
			// fmt.Println(svgChildParserElem.Attributes)

			rectAttr := svgChildParserElem.Attributes

			// create the g attributes struct using hte fill from the rect
			gAttributes := getGElemAttributesStruct(deployer_address, rectAttr["fill"])

			// create a new rect attributes struct
			rectAttributesStruct := getRectAttributesStruct(deployer_address, rectAttr["x"], rectAttr["y"], rectAttr["width"], rectAttr["height"])

			// create a new rect struct
			// rectStruct := getRectStruct("rect", "type", "value", rectAttributesStruct, emptyValueArray)
			rectStruct := getRectStruct(deployer_address, "rect", "type", "value", rectAttributesStruct)

			// slice of rect structs
			rectStructSlice := []cadence.Value{rectStruct}

			// create the cadence array of rect structs
			rectStructArray := cadence.NewArray(rectStructSlice)

			// create the g struct
			gStruct := getGElemStruct(deployer_address, gAttributes, rectStructArray)

			// add the rect struct to the cadenve struct slice just outside of this scope
			cadenceStructSlice = append(cadenceStructSlice, gStruct)
		}
	}

	// add the g structs slice to a cadence array
	cadenceGStructArray := cadence.NewArray(cadenceStructSlice)

	// create a single/parent svg struct
	svgStruct := cadence.Struct{
		Fields: []cadence.Value{cadence.String("svg"), svgAttributesStruct, cadenceGStructArray},
		StructType: &cadence.StructType{
			QualifiedIdentifier: "A." + deployer_address + ".IaNFTAnalogs.Svg",
			Fields: []cadence.Field{{
				Identifier: "name",
				Type:       cadence.StringType{},
			}, {
				Identifier: "attributes",
				Type:       &cadence.StructType{},
			}, {
				Identifier: "children",
				Type: cadence.VariableSizedArrayType{
					ElementType: &cadence.StructType{},
				},
			}},
		},
	}

	// fmt.Println("SVG STRUCT:::::::::::::::::::::")
	// fmt.Println(svgStruct)

	return svgStruct

}
