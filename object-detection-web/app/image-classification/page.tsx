"use client";
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import Image from "next/image"
import { ImageIcon, Loader2, ScanSearch } from 'lucide-react'
import React, { createElement, useEffect, useState } from 'react'
import { cn } from '@/lib/utils';
import Link from 'next/link';


type Props = {}
type BoxProps = {
    name: string,
    coord: any
}[]

const ImageClassificationPage = (props: Props) => {

    const [url, setUrl] = useState("")
    const [label, setLabel] = useState("")
    const [loading, setLoading ] = useState<boolean>(false)
    const [image, setImage] : any = useState(null)
    const [colors, setColors] : any = useState([])

    useEffect(() => {
        setColors(['red', 'purple', 'pink', 'blue', 'yellow', 'orange', 'green', 'lime'])
    }, [])

    var box : any = null
    var xmin:number = 102
    var ymin:number = 84
    var xmax:number = 172
    var ymax:number = 206
    return (
        <main id="test" className='
        flex
        flex-col
        items-center
        justify-start
        p-24
        gap-2'
        >
            <form className='
            flex
            gap-2
            items-center'
            onSubmit={uploadFiles} >
                <ImageIcon />
                <Input id="inp" name="files" type="file"></Input>
                <Button disabled={loading} type="submit">
                    {
                        loading ? (
                            <Loader2 className='animate-spin' />
                        ) : (<ScanSearch size={20} />)
                    }
                </Button>
            </form>
            { url && (<>
                <div className='relative'>
                    <Image src={url} width={400} height={400} alt={'uploaded image'} /> 
                    <svg className='absolute top-0 left-0 w-full h-full z-10 opacity-90 bg-transparent fill-transparent' width="400" height="400" viewBox="0 0 400 400" id="draw" xmlns="http://www.w3.org/2000/svg"> 

                    </svg>
                </div>
                <Link className={cn( buttonVariants( { variant: "ghost"}), 'text-xs text-muted-foreground')}
                    href={url}/>
            </>
            )}
            {
                label && <p className='font-bold text-l'>Detected: {label}</p>
            }
        </main>
    )

    /** Handler functions */
    
    async function uploadFiles (event : any) {
        event.preventDefault()
        const rect = document.querySelectorAll('rect').forEach(e => e.remove())
        const file = event.target[0].files[0]
        const url = URL.createObjectURL(file)

        const img = new (window as any).Image()
        img.src = url

        img.onload = function () {
            const maxWidth:number   = 400
            const maxHeight:number  = 400
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            const ratio = Math.min(maxWidth / img.width, maxHeight / img.height)
            const width = img.width * ratio + .5 | 0
            const height = img.height * ratio + .5 | 0

            canvas.width = width
            canvas.height = height

            ctx?.drawImage(img, 0, 0, width, height)
            document.body.appendChild(canvas)

            canvas.toBlob(async (blob) => {
                const fr = new FileReader()
                fr.readAsDataURL(blob!)
                const file = new File([blob!], "capture.jpg", {
                    type: 'image/jpeg'
                });
                var fd = new FormData();
                fd.append("files", file);


                setLoading(true)
                const response = await axios.post("/api/detect-objects", fd)
                setLoading(false)


                setUrl(response.data.url)
                box = response.data.box
                setTimeout(() => {
                    drawBoxes(box) 
                }, 1000)
                setLabel(response.data.label)
            }, 'image/png', 1)
        }
        
    }

    function drawBoxes (box : BoxProps | any) : void {
        setColors(['red', 'purple', 'pink', 'blue', 'sky', 'cyan', 'green', 'lime']) 
        const svg = document.getElementById("draw")
        var svgns = "http://www.w3.org/2000/svg"
        const array = JSON.parse(box)
        const m = new Map(array.map(pos => [pos.name, pos]));
        const uniques = [...m.values()];
        uniques.map((element : any) => {
            var index = Math.round(Math. random()*colors.length)
            element.color=colors[index]
        })
        /*array.forEach(function (element : any) {
            // Calculate random color for each element
            
            element.color = colors[Math.round(Math. random()*colors.length)]
          });*/
        console.log(uniques)
        array.map((box: any) => {
            
            var newRect = document.createElementNS(svgns, 'rect');
            var width : string  = String(box.coord.xmax - box.coord.xmin)
            var height : string  = String(box.coord.ymax-box.coord.ymin)
            var color :any = uniques.find((o : any) => o.name === box.name);
            newRect.setAttribute('x', box.coord.xmin)
            newRect.setAttribute('y', box.coord.ymin)
            newRect.setAttribute('width', width)
            newRect.setAttribute('height', height)
            newRect.setAttribute('name', 'boxes')
            newRect.setAttribute('style', `fill: ${color.color}; fill-opacity:20%; border: 10px; stroke: red; `)
            //newRect.setAttribute('class', `fill-${color.color}-950`)
            console.log(newRect)
            svg!.appendChild(newRect)
        })
    }

    

}

export default ImageClassificationPage