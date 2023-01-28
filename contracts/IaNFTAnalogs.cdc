/**
This contract provides the basis for a never-not-serializable Cadence analogs to
the SVG file format. It aims to make on-chain artwork that can be modified
across Flow projects easy. The idea is that the structure of an SVG file can be
represented in Cadence so that we can safely modify its its properties

All of the structs here are composted to create an IaNFTAnalogs.Svg struct,
which can then be serialzed into front-end code and used to display and modify
the artwork.

Do not deploy this contract to testnet or mainnet, instead point to the one
deployed by the FOASIS project.
*/


pub contract IaNFTAnalogs {

    // TODO: should the values here be UInt64 instead?
    pub struct RectAttributes {
        pub let x: String
        pub let y: String
        pub let width: String
        pub let height: String

        init(
            x: String,
            y: String,
            width: String,
            height: String,
        ) {
            self.x = x
            self.y = y
            self.width = width
            self.height = height
        }
    }

    pub struct Rect {
        pub let name: String
        pub let type: String
        pub let value: String
        pub let attributes: RectAttributes

        init(
            name: String,
            type: String,
            value: String,
            attributes: RectAttributes,
        ) {
            self.name = name
            self.type = type
            self.value = value
            self.attributes = attributes
        }
    }

    pub struct GElemAttributes {
        pub var fill: String

        pub fun setFill(_ fill: String){
            self.fill = fill
        }

        init(
            fill: String,
        ) {
            self.fill = fill
        }
    }

    pub struct GElem {
        pub let name: String
        pub let type: String
        pub let value: String
        pub let attributes: GElemAttributes
        pub let children: [Rect]

        init(
            name: String,
            type: String,
            value: String,
            attributes: GElemAttributes,
            children: [Rect]
        ) {
            self.name = name
            self.type = type
            self.value = value
            self.attributes = attributes
            self.children = children
        }
    }

    pub struct SvgAttributes {
        pub let width: String
        pub let height: String
        pub let baseProfile: String
        pub let version: String
        pub let viewBox: String
        pub let xmlns: String
        pub let style: String

        init(width: String, height: String, baseProfile: String, version: String, viewBox: String, xmlns: String, style: String) {
            self.width=width
            self.height=height
            self.baseProfile=baseProfile
            self.version=version
            self.viewBox=viewBox
            self.xmlns=xmlns
            self.style=style
        }
    }

	pub struct Svg {
        pub let name: String
        pub let attributes: SvgAttributes
        pub let children: [GElem]

		init(name: String, attributes: SvgAttributes, children: [GElem]) {
			self.name=name
            self.attributes=attributes
            self.children=children
		}
	}
}
