import { Toaster as Sonner } from "sonner"
import * as React from "react"

type ToasterProps = React.ComponentProps<typeof Sonner>

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"   // change to "dark" if needed
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-white text-black border border-gray-200 shadow-lg",
          description: "text-gray-600",
          actionButton: "bg-blue-600 text-white",
          cancelButton: "bg-gray-200 text-black",
        },
      }}
      {...props}
    />
  )
}
