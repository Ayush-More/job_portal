"use client"

import { MessageCircle } from "lucide-react"
import { useState } from "react"

interface WhatsAppChatProps {
  phoneNumber: string
  message?: string
  position?: "bottom-right" | "bottom-left"
}

export function WhatsAppChat({ 
  phoneNumber, 
  message = "Hello! I need help with Ittihad Placement.",
  position = "bottom-right"
}: WhatsAppChatProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Format phone number (remove any non-digit characters)
  const formattedPhone = phoneNumber.replace(/\D/g, "")
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`

  const handleClick = () => {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <div
      className={`fixed ${position === "bottom-right" ? "right-4 md:right-6" : "left-4 md:left-6"} bottom-4 md:bottom-6 z-50 transition-all duration-300`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip */}
      {isHovered && (
        <div className={`hidden md:block absolute ${position === "bottom-right" ? "right-0" : "left-0"} bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap animate-fade-in`}>
          Chat with us on WhatsApp
          <div className={`absolute ${position === "bottom-right" ? "right-4" : "left-4"} top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900`}></div>
        </div>
      )}

      {/* WhatsApp Button */}
      <button
        onClick={handleClick}
        className="group relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 hover:bg-[#20BA5A]"
        aria-label="Chat with us on WhatsApp"
      >
        <MessageCircle className="h-7 w-7 md:h-8 md:w-8" />
        
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75"></span>
        
        {/* Notification badge */}
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          1
        </span>
      </button>
    </div>
  )
}

