import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ShipmentData {
  trackingNumber: string;
  status: string;
  estimatedDelivery?: string;
  origin: string;
  originAddress?: string;
  destination: string;
  destinationAddress?: string;
  finalDestination?: string;
  finalDestinationAddress?: string;
  service: string;
  transportMode: string;
  weight: string;
  dimensions?: string;
  declaredValue?: string;
  totalAmount: string;
  paymentStatus: string;
  amountPaid?: string;
  sender: string;
  senderPhone?: string;
  senderEmail?: string;
  receiver: string;
  receiverPhone?: string;
  receiverEmail?: string;
  currentLocation?: string;
  pickupDate?: string;
  deliveredAt?: string;
  notes?: string;
  packageDescription?: string;
  events: Array<{
    status: string;
    location: string;
    timestamp: string;
    description: string;
  }>;
}

export async function generateTrackingPDF(shipment: ShipmentData): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let pageCount = 1; // Track page count manually
  
  // Helper function to format status names with spaces instead of underscores
  const formatStatusName = (status: string) => {
    return status
      .replace(/_/g, ' ')           // Replace underscores with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
  };
  
  // Helper function to add new page and update count
  const addNewPage = () => {
    pdf.addPage();
    pageCount++;
  };
  
  // Colors
  const primaryColor = [59, 130, 246] as [number, number, number];
  const accentColor = [236, 72, 153] as [number, number, number];
  const textColor = [55, 65, 81] as [number, number, number];
  const lightGray = [156, 163, 175] as [number, number, number];
  
  // Helper function for text
  const addText = (text: string, x: number, y: number, fontSize: number = 12, color: number[] = textColor) => {
    pdf.setFontSize(fontSize);
    pdf.setTextColor(color[0], color[1], color[2]);
    pdf.text(text, x, y);
  };
  
  // Header
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  addText('SwiftShip Tracking Report', 20, 25, 20, [255, 255, 255]);
  pdf.text('Generated on ' + new Date().toLocaleDateString(), pageWidth - 20, 25, { align: 'right' });
  
  // Tracking Number Section
  let yPosition = 60;
  addText('Tracking Number', 20, yPosition, 16, primaryColor);
  yPosition += 8;
  addText(shipment.trackingNumber, 20, yPosition, 24);
  yPosition += 15;
  
  // Status Badge
  pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.rect(20, yPosition - 5, 60, 8, 'F');
  addText(formatStatusName(shipment.status).toUpperCase(), 23, yPosition, 10, [255, 255, 255]);
  yPosition += 15;
  
  // Service Type
  addText('Service: ' + shipment.service, 20, yPosition, 12, lightGray);
  yPosition += 20;
  
  // Divider
  pdf.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 15;
  
  // Route Information
  addText('Shipping Route', 20, yPosition, 16, primaryColor);
  yPosition += 10;
  
  // Origin
  addText('ORIGIN', 20, yPosition, 10, lightGray);
  yPosition += 6;
  addText(shipment.origin, 20, yPosition, 12);
  if (shipment.originAddress) {
    yPosition += 5;
    addText(shipment.originAddress, 20, yPosition, 10, lightGray);
  }
  yPosition += 15;
  
  // Destination
  addText('DESTINATION', 20, yPosition, 10, lightGray);
  yPosition += 6;
  addText(shipment.destination, 20, yPosition, 12);
  if (shipment.destinationAddress) {
    yPosition += 5;
    addText(shipment.destinationAddress, 20, yPosition, 10, lightGray);
  }
  yPosition += 15;
  
  // Final Destination (if different)
  if (shipment.finalDestination && shipment.finalDestination !== shipment.destination) {
    addText('FINAL DESTINATION', 20, yPosition, 10, accentColor);
    yPosition += 6;
    addText(shipment.finalDestination, 20, yPosition, 12);
    if (shipment.finalDestinationAddress) {
      yPosition += 5;
      addText(shipment.finalDestinationAddress, 20, yPosition, 10, lightGray);
    }
    yPosition += 15;
  }
  
  // Transport Mode
  addText('Transport Mode: ' + shipment.transportMode.toUpperCase(), 20, yPosition, 12, lightGray);
  yPosition += 15;
  
  // Estimated Delivery
  if (shipment.estimatedDelivery) {
    addText('Estimated Delivery', 20, yPosition, 12, lightGray);
    yPosition += 6;
    addText(shipment.estimatedDelivery, 20, yPosition, 14, primaryColor);
    yPosition += 15;
  }
  
  // Current Location
  if (shipment.currentLocation) {
    addText('Current Location', 20, yPosition, 12, lightGray);
    yPosition += 6;
    addText(shipment.currentLocation, 20, yPosition, 12);
    yPosition += 15;
  }
  
  // Divider
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 15;
  
  // Package Details - Shipping Charges Section
  addText('Shipping Charges', 20, yPosition, 16, primaryColor);
  yPosition += 10;
  
  const shippingDetails = [
    { label: 'Service Cost', value: '$' + shipment.totalAmount },
    { label: 'Payment Status', value: shipment.paymentStatus }
  ];
  
  if (shipment.amountPaid) {
    shippingDetails.push({ label: 'Amount Paid', value: '$' + shipment.amountPaid });
  }
  
  shippingDetails.forEach(detail => {
    // Check if we need a new page before adding this detail
    if (yPosition > pageHeight - 30) {
      addNewPage();
      yPosition = 30;
      
      // Header on new page
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      addText('SwiftShip Tracking Report (Shipping Charges)', 20, 25, 16, [255, 255, 255]);
      yPosition = 60;
    }
    
    addText(detail.label + ':', 20, yPosition, 12, lightGray);
    addText(detail.value, 80, yPosition, 12);
    yPosition += 10;
  });
  
  yPosition += 15;
  
  // Package Value Section
  if (shipment.declaredValue) {
    // Check if we need a new page before package value section
    if (yPosition > pageHeight - 80) {
      addNewPage();
      yPosition = 30;
      
      // Header on new page
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      addText('SwiftShip Tracking Report (Package Value)', 20, 25, 16, [255, 255, 255]);
      yPosition = 60;
    }
    
    // Package value box
    pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setFillColor(249, 250, 251); // Light background
    pdf.roundedRect(20, yPosition - 5, pageWidth - 40, 40, 3, 3, 'FD');
    
    addText('Package Value', 25, yPosition, 14, primaryColor);
    yPosition += 8;
    addText('For insurance & customs purposes', 25, yPosition, 10, lightGray);
    yPosition += 8;
    addText('$' + shipment.declaredValue, 25, yPosition, 16, primaryColor);
    yPosition += 15;
    
    // Explanation text
    const explanation = 'The declared value is the insured value of your package contents and is not included in shipping cost.';
    const splitExplanation = pdf.splitTextToSize(explanation, pageWidth - 40);
    splitExplanation.forEach((line: string) => {
      if (yPosition > pageHeight - 30) {
        addNewPage();
        yPosition = 30;
        
        // Header on new page
        pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.rect(0, 0, pageWidth, 40, 'F');
        addText('SwiftShip Tracking Report (Package Value)', 20, 25, 16, [255, 255, 255]);
        yPosition = 60;
      }
      
      addText(line, 20, yPosition, 10, lightGray);
      yPosition += 6;
    });
    
    yPosition += 15;
  }
  
  // Overall Total Section
  if (shipment.declaredValue) {
    // Check if we need a new page before overall total
    if (yPosition > pageHeight - 80) {
      addNewPage();
      yPosition = 30;
      
      // Header on new page
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      addText('SwiftShip Tracking Report (Overall Summary)', 20, 25, 16, [255, 255, 255]);
      yPosition = 60;
    }
    
    // Overall total box with gradient effect (simulated with border)
    pdf.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    pdf.setFillColor(240, 248, 255); // Light blue background
    pdf.roundedRect(20, yPosition - 5, pageWidth - 40, 50, 3, 3, 'FD');
    
    addText('Overall Summary', 25, yPosition, 14, primaryColor);
    yPosition += 10;
    
    addText('Shipping Cost:', 25, yPosition, 11, lightGray);
    addText('$' + shipment.totalAmount, pageWidth - 60, yPosition, 11);
    yPosition += 8;
    
    addText('Package Value:', 25, yPosition, 11, lightGray);
    addText('$' + shipment.declaredValue, pageWidth - 60, yPosition, 11);
    yPosition += 8;
    
    // Divider line
    pdf.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.line(25, yPosition, pageWidth - 65, yPosition);
    yPosition += 8;
    
    const overallTotal = (parseFloat(shipment.declaredValue) + parseFloat(shipment.totalAmount)).toFixed(2);
    addText('Overall Total:', 25, yPosition, 12, primaryColor);
    addText('$' + overallTotal, pageWidth - 60, yPosition, 16, primaryColor);
    yPosition += 15;
    
    // Explanation text
    const totalExplanation = 'Overall total includes shipping cost plus declared package value.';
    const splitTotalExplanation = pdf.splitTextToSize(totalExplanation, pageWidth - 40);
    splitTotalExplanation.forEach((line: string) => {
      if (yPosition > pageHeight - 30) {
        addNewPage();
        yPosition = 30;
        
        // Header on new page
        pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.rect(0, 0, pageWidth, 40, 'F');
        addText('SwiftShip Tracking Report (Overall Summary)', 20, 25, 16, [255, 255, 255]);
        yPosition = 60;
      }
      
      addText(line, 20, yPosition, 10, lightGray);
      yPosition += 6;
    });
    
    yPosition += 15;
  }
  
  // Package Information Section
  // Check if we have enough space for package information
  if (yPosition > pageHeight - 120) {
    addNewPage();
    yPosition = 30;
    
    // Header on new page
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    addText('SwiftShip Tracking Report (Package Information)', 20, 25, 16, [255, 255, 255]);
    yPosition = 60;
  }
  
  addText('Package Information', 20, yPosition, 16, primaryColor);
  yPosition += 10;
  
  const packageInfo = [
    { label: 'Tracking Number', value: shipment.trackingNumber },
    { label: 'Weight', value: shipment.weight },
    { label: 'Service Type', value: shipment.service },
    { label: 'Transport Mode', value: shipment.transportMode }
  ];
  
  // Add optional package info
  if (shipment.dimensions) {
    packageInfo.push({ label: 'Dimensions', value: shipment.dimensions });
  }
  if (shipment.estimatedDelivery) {
    packageInfo.push({ label: 'Estimated Delivery', value: shipment.estimatedDelivery });
  }
  if (shipment.currentLocation) {
    packageInfo.push({ label: 'Current Location', value: shipment.currentLocation });
  }
  if (shipment.pickupDate) {
    packageInfo.push({ label: 'Pickup Date', value: shipment.pickupDate });
  }
  if (shipment.deliveredAt) {
    packageInfo.push({ label: 'Delivered At', value: shipment.deliveredAt });
  }
  
  packageInfo.forEach(info => {
    // Check if we need a new page before adding this info
    if (yPosition > pageHeight - 30) {
      addNewPage();
      yPosition = 30;
      
      // Header on new page
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      addText('SwiftShip Tracking Report (Package Information)', 20, 25, 16, [255, 255, 255]);
      yPosition = 60;
    }
    
    addText(info.label + ':', 20, yPosition, 12, lightGray);
    addText(info.value, 80, yPosition, 12);
    yPosition += 10;
  });
  
  yPosition += 15;
  
  // Divider
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 15;
  
  // Package Description
  if (shipment.packageDescription) {
    // Check if we need a new page before package description
    if (yPosition > pageHeight - 60) {
      addNewPage();
      yPosition = 30;
      
      // Header on new page
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      addText('SwiftShip Tracking Report (Package Details)', 20, 25, 16, [255, 255, 255]);
      yPosition = 60;
    }
    
    addText('Package Description', 20, yPosition, 16, primaryColor);
    yPosition += 10;
    
    const splitDescription = pdf.splitTextToSize(shipment.packageDescription, pageWidth - 40);
    splitDescription.forEach((line: string) => {
      // Check if we need a new page for this line
      if (yPosition > pageHeight - 30) {
        addNewPage();
        yPosition = 30;
        
        // Header on new page
        pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.rect(0, 0, pageWidth, 40, 'F');
        addText('SwiftShip Tracking Report (Package Details)', 20, 25, 16, [255, 255, 255]);
        yPosition = 60;
      }
      
      addText(line, 20, yPosition, 11);
      yPosition += 6;
    });
    yPosition += 15;
    
    // Divider
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 15;
  }
  
  // Addresses Section
  // Check if we have enough space for contact information
  if (yPosition > pageHeight - 100) {
    addNewPage();
    yPosition = 30;
    
    // Header on new page
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    addText('SwiftShip Tracking Report (Contact Information)', 20, 25, 16, [255, 255, 255]);
    yPosition = 60;
  }
  
  addText('Contact Information', 20, yPosition, 16, primaryColor);
  yPosition += 10;
  
  // Sender Information
  addText('SENDER', 20, yPosition, 12, primaryColor);
  yPosition += 8;
  addText('Name: ' + shipment.sender, 20, yPosition, 11);
  yPosition += 6;
  if (shipment.senderPhone) {
    addText('Phone: ' + shipment.senderPhone, 20, yPosition, 11);
    yPosition += 6;
  }
  if (shipment.senderEmail) {
    addText('Email: ' + shipment.senderEmail, 20, yPosition, 11);
    yPosition += 6;
  }
  yPosition += 10;
  
  // Receiver Information
  addText('RECEIVER', 20, yPosition, 12, primaryColor);
  yPosition += 8;
  addText('Name: ' + shipment.receiver, 20, yPosition, 11);
  yPosition += 6;
  if (shipment.receiverPhone) {
    addText('Phone: ' + shipment.receiverPhone, 20, yPosition, 11);
    yPosition += 6;
  }
  if (shipment.receiverEmail) {
    addText('Email: ' + shipment.receiverEmail, 20, yPosition, 11);
    yPosition += 6;
  }
  yPosition += 15;
  
  // Admin Notes
  if (shipment.notes) {
    // Check if we have enough space for admin notes
    if (yPosition > pageHeight - 60) {
      addNewPage();
      yPosition = 30;
      
      // Header on new page
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      addText('SwiftShip Tracking Report (Notes)', 20, 25, 16, [255, 255, 255]);
      yPosition = 60;
    }
    
    // Divider
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 15;
    
    addText('Notes', 20, yPosition, 16, accentColor);
    yPosition += 10;
    
    const splitNotes = pdf.splitTextToSize(shipment.notes, pageWidth - 40);
    splitNotes.forEach((line: string) => {
      // Check if we need a new page for this line
      if (yPosition > pageHeight - 30) {
        addNewPage();
        yPosition = 30;
        
        // Header on new page
        pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.rect(0, 0, pageWidth, 40, 'F');
        addText('SwiftShip Tracking Report (Notes)', 20, 25, 16, [255, 255, 255]);
        yPosition = 60;
      }
      
      addText(line, 20, yPosition, 11);
      yPosition += 6;
    });
    yPosition += 15;
  }
  
  // Divider
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 15;
  
  // Tracking History
  addText('Tracking History', 20, yPosition, 16, primaryColor);
  yPosition += 15;
  
  shipment.events.forEach((event, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      addNewPage();
      yPosition = 30;
      
      // Header on new page
      pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      addText('SwiftShip Tracking Report (Continued)', 20, 25, 16, [255, 255, 255]);
      yPosition = 60;
    }
    
    // Event box
    pdf.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.setFillColor(249, 250, 251); // Light background
    pdf.roundedRect(20, yPosition - 8, pageWidth - 40, 35, 3, 3, 'FD');
    
    // Event content
    addText(formatStatusName(event.status), 25, yPosition, 12, primaryColor);
    yPosition += 6;
    addText(event.location, 25, yPosition, 10, lightGray);
    yPosition += 6;
    addText(event.timestamp, 25, yPosition, 10, lightGray);
    yPosition += 6;
    
    // Description (word wrap)
    const splitDescription = pdf.splitTextToSize(event.description, pageWidth - 70);
    splitDescription.forEach((line: string) => {
      addText(line, 25, yPosition, 10);
      yPosition += 5;
    });
    
    yPosition += 12;
  });
  
  // Footer
  const footerY = pageHeight - 20;
  pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.rect(0, footerY - 10, pageWidth, 30, 'F');
  
  addText('This is an official tracking report from SwiftShip', 20, footerY, 10, [255, 255, 255]);
  pdf.text(`Page ${pageCount}`, pageWidth / 2, footerY + 10, { align: 'center' });
  
  // Add watermark
  const GStateCtor = ((jsPDF as any).GState || (pdf as any).GState) as any;
  if (GStateCtor) {
    pdf.setGState(new (GStateCtor as any)({ opacity: 0.1 }));
  }
  pdf.setFontSize(48);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text('SwiftShip', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
  if (GStateCtor) {
    pdf.setGState(new (GStateCtor as any)({ opacity: 1 }));
  }
  
  // Save the PDF
  pdf.save(`SwiftShip_Tracking_${shipment.trackingNumber}.pdf`);
}
