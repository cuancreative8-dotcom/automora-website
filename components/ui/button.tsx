import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-button border border-transparent bg-clip-padding text-sm font-semibold tracking-[-0.01em] whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-button hover:bg-brand-blue-deep hover:shadow-button-hover",
        outline:
          "border-brand-blue/35 bg-background text-foreground hover:border-brand-blue hover:bg-brand-ice hover:text-brand-blue-deep aria-expanded:border-brand-blue aria-expanded:bg-brand-ice",
        secondary:
          "bg-brand-navy text-white shadow-button hover:bg-brand-navy/90 hover:shadow-button-hover aria-expanded:bg-brand-navy",
        accent:
          "bg-brand-pink text-brand-navy shadow-button hover:bg-brand-pink/90 hover:shadow-button-hover",
        ghost:
          "text-foreground hover:bg-secondary hover:text-secondary-foreground aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        destructive:
          "bg-destructive text-white shadow-button hover:bg-destructive/90 hover:shadow-button-hover focus-visible:border-destructive focus-visible:ring-destructive/30",
        link: "h-auto px-0 text-primary underline-offset-4 hover:text-brand-blue-deep hover:underline",
      },
      size: {
        default:
          "h-11 gap-2 px-5 in-data-[slot=button-group]:rounded-button has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-7 gap-1 px-2.5 text-xs in-data-[slot=button-group]:rounded-button has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-4 in-data-[slot=button-group]:rounded-button has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        lg: "h-12 gap-2 px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-11",
        "icon-xs":
          "size-7 in-data-[slot=button-group]:rounded-button [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-9 in-data-[slot=button-group]:rounded-button",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
