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
    const [height, setHeight] = useState(0)
    const [width, setWidth] = useState(0)
    const [label, setLabel] = useState("")
    const [loading, setLoading ] = useState<boolean>(false)
    const [image, setImage] : any = useState(null)
    const [colors, setColors] : any = useState([])

    useEffect(() => {
        setColors(['red', 'purple', 'hotpink', 'blue', 'yellow', 'orange', 'green'])
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
        gap-2
        w-full
        h-full'
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
                <div id="draw" className='relative '>
                    <Image src={url} width={width} height={height} alt={'uploaded image'} /> 
                </div>
                <Link className={cn( buttonVariants( { variant: "ghost"}), 'text-xs text-muted-foreground')}
                    href={url}/>
            </>
            )}
            {
                label && <p className='font-bold text-l text-green-600'>{label}</p>
            }
        </main>
    )

    /** Handler functions */
    
    async function uploadFiles (event : any) {
        event.preventDefault()
        const svg = document.getElementById("draw")
        document.querySelectorAll('[name="boxes"]').forEach(e => e.remove())
        const file = event.target[0].files[0]
        const url = URL.createObjectURL(file)

        const img = new (window as any).Image()
        img.src = url
        
        const formData = new FormData(event.target)
        
        img.onload = async function () {
            
            setLoading(true)
            const response = await axios.post("/api/detect-objects", formData)
            setLoading(false)
            
            setWidth(img.width)
            setHeight(img.height)
            setUrl(response.data.url)
            setLabel(formatLabel(response.data.label))
            box = response.data.box
            setTimeout(() => {
                drawBoxes(box) 
            }, 1000)
        }
        
    }

    function formatLabel(label : string) : string {
        const fLabel = JSON.parse(label)
        let obj = Object.keys(fLabel)
        var labelFinal = ''
        var count = 0

        obj.forEach((label) => {
            if (count == 0) {
                labelFinal += `${fLabel[label] == 1 ? 'There is' : 'There are '} ${fLabel[label]} ${label}`
            } else {
                labelFinal += `, ${fLabel[label]} ${label}`
            }
            count+=1
        })

        return labelFinal;
    }

    function drawBoxes (box : any) : void {
        setColors(['red', 'purple', 'hotpink', 'blue', 'cyan', 'green', 'orange']) 
        const svg = document.getElementById("draw")
        var svgns = "http://www.w3.org/2000/svg"
        const array = JSON.parse(box)
        
        console.log(array)
        array.map((box: any) => {
            const color =
            "#" +
            Math.floor(Math.random() * 0xffffff)
              .toString(16)
              .padStart(6, '0');
            const boxElement = document.createElement("div");
            boxElement.setAttribute("name", "boxes")
            Object.assign(boxElement.style, {
                zIndex: "99",
                borderWidth: "2px",
                borderStyle: "solid",
                borderColor: color,
                left: 100 * box.coord.xmin + "%",
                top: 100 * box.coord.ymin + "%",
                width: 100 * (box.coord.xmax - box.coord.xmin) + "%",
                height: 100 * (box.coord.ymax - box.coord.ymin) + "%",
                position: "absolute"
            });
            const labelElement = document.createElement("span");
            labelElement.textContent = box.name + " " + (box.score * 100).toFixed(2) + "%";
            labelElement.style.backgroundColor = color;
            labelElement.style.color = "white";
            labelElement.style.zIndex = "99";
            labelElement.setAttribute("name", "boxes")

            boxElement.appendChild(labelElement);

            svg?.appendChild(boxElement)
        })
    }

    

}

export default ImageClassificationPage