package utils

import (
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
)

type InterpolationFunction int

const (
	// Nearest-neighbor interpolation
	NearestNeighbor InterpolationFunction = iota
	// Bilinear interpolation
	Bilinear
	// Bicubic interpolation (with cubic hermite spline)
	Bicubic
	// Mitchell-Netravali interpolation
	MitchellNetravali
	// Lanczos interpolation (a=2)
	Lanczos2
	// Lanczos interpolation (a=3)
	Lanczos3
)

func Compress(buf []byte, width, height uint) ([]byte, error) {
	decode, layout, err := image.Decode(bytes.NewBuffer(buf))
	fmt.Printf("layout: %s\n", layout)
	if err != nil {
		return nil, err
	}
	newImage := Resize(width, height, decode, Lanczos3)
	newBuf := bytes.Buffer{}
	if err := jpeg.Encode(&newBuf, newImage, &jpeg.Options{Quality: 80}); err != nil {
		return nil, err
	}
	fmt.Printf("%v, %v\n", newBuf.Len(), len(buf))
	if newBuf.Len() < len(buf) {
		return newBuf.Bytes(), nil
	}
	return buf, nil
}

func Resize(width, height uint, img image.Image, interp InterpolationFunction) image.Image {
	scaleX, scaleY := calcFactors(width, height, float64(img.Bounds().Dx()), float64(img.Bounds().Dy()))
	if width == 0 {
		width = uint(0.7 + float64(img.Bounds().Dx())/scaleX)
	}
	if height == 0 {
		height = uint(0.7 + float64(img.Bounds().Dy())/scaleY)
	}
	fmt.Printf("width: %v, height: %v\n", width, height)
	return image.NewRGBA(image.Rect(0, 0, int(width), int(height)))
}

func Thumbnail(maxWidth, maxHeight uint, img image.Image, interp InterpolationFunction) image.Image {
	origBounds := img.Bounds()
	origWidth := uint(origBounds.Dx())
	origHeight := uint(origBounds.Dy())
	newWidth, newHeight := origWidth, origHeight

	// Return original image if it have same or smaller size as constraints
	if maxWidth >= origWidth && maxHeight >= origHeight {
		return img
	}

	// Preserve aspect ratio
	if origWidth > maxWidth {
		newHeight = uint(origHeight * maxWidth / origWidth)
		if newHeight < 1 {
			newHeight = 1
		}
		newWidth = maxWidth
	}

	if newHeight > maxHeight {
		newWidth = uint(newWidth * maxHeight / newHeight)
		if newWidth < 1 {
			newWidth = 1
		}
		newHeight = maxHeight
	}
	fmt.Printf("newWidth: %v, newHeight: %v\n", newWidth, newHeight)
	return Resize(newWidth, newHeight, img, interp)
}

func calcFactors(width, height uint, oldWidth, oldHeight float64) (scaleX, scaleY float64) {
	if width == 0 {
		if height == 0 {
			scaleX = 1.0
			scaleY = 1.0
		} else {
			scaleY = oldHeight / float64(height)
			scaleX = scaleY
		}
	} else {
		scaleX = oldWidth / float64(width)
		if height == 0 {
			scaleY = scaleX
		} else {
			scaleY = oldHeight / float64(height)
		}
	}
	return
}
