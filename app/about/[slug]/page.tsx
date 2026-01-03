"use client"
import { useParams } from 'next/navigation'

function AboutSlugPage() {
  const param = useParams()
  // console.log(param)

  return (
    <div>Hello, this is slug: {param.slug}</div>
  )
}

export default AboutSlugPage
