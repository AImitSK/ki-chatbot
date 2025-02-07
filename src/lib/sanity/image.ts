// lib/sanity/image.ts
import imageUrlBuilder from '@sanity/image-url'
import { client } from './client'

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  const imageBuilder = builder.image(source)
  const originalUrl = imageBuilder.url

  // Überschreibe die url() Methode, um den Cache-Busting-Parameter hinzuzufügen
  imageBuilder.url = function() {
    return `${originalUrl.call(this)}?t=${Date.now()}`
  }

  return imageBuilder
}