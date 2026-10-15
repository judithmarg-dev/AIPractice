export interface IceCream {
  id: string
  name: string
  description: string
  category: string
  image_placeholder: string
  /** Price in USD. For `artesanal` items this is the price per scoop. */
  price: number
  /** Optional uploaded image as a data URL. */
  image?: string
  /** Optional "envase de presentación". */
  container?: string
  inventory_count: number
  archived: boolean
  created_at: string
}
