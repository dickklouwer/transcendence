class SVGDrawer {
	width: number;
	height: number;
  
	context: CanvasRenderingContext2D;
	svgString: string = '<svg viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#44e708"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M11.302 21.6149C11.5234 21.744 11.6341 21.8086 11.7903 21.8421C11.9116 21.8681 12.0884 21.8681 12.2097 21.8421C12.3659 21.8086 12.4766 21.744 12.698 21.6149C14.646 20.4784 20 16.9084 20 12V6.6C20 6.04207 20 5.7631 19.8926 5.55048C19.7974 5.36198 19.6487 5.21152 19.4613 5.11409C19.25 5.00419 18.9663 5.00084 18.3988 4.99413C15.4272 4.95899 13.7136 4.71361 12 3C10.2864 4.71361 8.57279 4.95899 5.6012 4.99413C5.03373 5.00084 4.74999 5.00419 4.53865 5.11409C4.35129 5.21152 4.20259 5.36198 4.10739 5.55048C4 5.7631 4 6.04207 4 6.6V12C4 16.9084 9.35396 20.4784 11.302 21.6149Z" stroke="#2af202" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
	img: HTMLImageElement;
	url: string | null = null;
  
	constructor( context: CanvasRenderingContext2D, size: number) 
	{
	  this.context = context;
  
  
	  this.width = size;
	  this.height = size;

	  this.img = new Image();
  
	  // Create a Blob from the SVG string
	  const svgBlob = new Blob([this.svgString], { type: "image/svg+xml" });
	  this.url = URL.createObjectURL(svgBlob);
  
	  // Assign the URL to the img element
	  this.img.src = this.url;
  
	  // Cleanup the URL when the image is loaded
	  this.img.onload = () => {
		URL.revokeObjectURL(this.url!); // Clean up object URL after use
	  };
	}
  
	draw(position: number) {
	  
	  // Draw the SVG image onto the canvas when it's loaded
	  this.img.onload = () => {
		this.context.drawImage(
		  this.img,
		  185,
		  position,
		  this.width,
		  this.height
		);
	  };
	}
  }
  
  export default SVGDrawer;
  