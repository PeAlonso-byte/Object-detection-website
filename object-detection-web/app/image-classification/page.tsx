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
            {
                label && <p id='rLabel' className='font-bold text-l text-red-600'>{label}</p>
            }
            { url && (<>
                <div id="draw" className='relative '>
                    <Image src={url} width={width} height={height} alt={'uploaded image'} /> 
                </div>
                <Link className={cn( buttonVariants( { variant: "ghost"}), 'text-xs text-muted-foreground')}
                    href={url}/>
            </>
            )}
            

            <div id="canvasH" className='relative gap-2'>
                <div id="canvasV" className='flex gap-2 overflow-x-scroll snap-x pb-4'></div>
            </div>
        </main>
    )

    /** Handler functions */
  
    
    
    async function uploadFiles (event : any) {
        event.preventDefault()
        const svg = document.getElementById("draw")
        if (svg) {
            document.getElementById("draw")?.querySelectorAll('[name="boxes"]').forEach(e => e.remove())
        } else {
            document.querySelectorAll('[name="boxes"]').forEach(e => e.remove())
        }
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

            if (svg) {
                const mainImg = svg.childNodes[0] as HTMLImageElement
                mainImg.src = response.data.url
                mainImg.srcset = response.data.url
                mainImg.width = img.width
                mainImg.height = img.height
            }
            setLabel(formatLabel(response.data.label))
            box = response.data.box
            setTimeout(() => {
                drawBoxes(box, true) 
                addHistory()
            }, 1000)
        }

        //compressImageandAddCanvas(event)
        
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

    function drawBoxes (box : any, flag : boolean) : void {
        setColors(['red', 'purple', 'hotpink', 'blue', 'cyan', 'green', 'orange']) 
        const svg = flag ? document.getElementById("draw") : document.getElementById("canvasV")
        const array = JSON.parse(box)
        array.map((box: any) => {
            const color =
            "#" +
            Math.floor(Math.random() * 0xffffff)
              .toString(16)
              .padStart(6, '0');
            const boxElement = document.createElement("div");
            boxElement.setAttribute("name", "boxes")
            boxElement.setAttribute("id", "boxes")
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

    function addHistory() {

        const boxElement = document.createElement("div") as HTMLElement
        boxElement.setAttribute('class', 'shrink-0 gap-2')
        const canvasH = document.getElementById("canvasV")
        const rLabel = document.getElementById("rLabel")
        const imgClone = document.getElementById("draw")
        var newImg = imgClone?.cloneNode(true) as HTMLElement
        var rLabelClone = rLabel?.cloneNode(true) as HTMLElement
        newImg.setAttribute('id', 'drawH')
        newImg.setAttribute('class', 'relative')
        var img = (newImg?.firstChild) as HTMLElement
        img.setAttribute('width', '400')
        img.setAttribute('height', '400')

        boxElement?.append(rLabelClone!)
        boxElement?.append(newImg!)
        boxElement.onclick = ((e) => {
            const obj = e.target as HTMLElement
            let parentObject = obj.parentElement?.id == 'drawH' ? obj.parentElement.parentElement : obj.parentElement
            if (parentObject?.id == 'boxes') {
                parentObject = parentObject.parentElement?.parentElement!
            }
            const mainImg = parentObject?.childNodes[1].childNodes[0] as HTMLImageElement
            const mainDiv = document.getElementById("draw")
            const imgWidth = mainImg.naturalWidth
            const imgHeight = mainImg.naturalHeight

            const clonedDiv = parentObject?.cloneNode(true) as HTMLElement
            const clonedDivChild = clonedDiv.childNodes[1] as HTMLElement
            const clonedImg = clonedDiv.childNodes[1].childNodes[0] as HTMLImageElement
            clonedDivChild.setAttribute('id', 'draw')
            clonedImg.setAttribute('height', `${imgHeight}`)
            clonedImg.setAttribute('width', `${imgWidth}`)
            mainDiv?.replaceWith(clonedDiv.childNodes[1])
            setLabel(clonedDiv.childNodes[0].textContent!)
            

        })
        
        canvasH?.append(boxElement!)

    }

    function compressImageandAddCanvas (event : any) {
        const file = event.target[0].files[0]
        const url = URL.createObjectURL(file)
        const canvasH = document.getElementById("canvasH")

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
            canvas.setAttribute("class", "p-3")
            ctx?.drawImage(img, 0, 0, width, height)
            canvasH?.appendChild(canvas)

            canvas.toBlob(async (blob) => {
                const fr = new FileReader()
                fr.readAsDataURL(blob!)
                const file = new File([blob!], "capture.jpg", {
                    type: 'image/jpeg'
                });
                var fd = new FormData();
                fd.append("files", file);


                /*setLoading(true)
                const response = await axios.post("/api/detect-objects", fd)
                setLoading(false)


                setUrl(response.data.url)
                box = response.data.box
                setTimeout(() => {
                    drawBoxes(box ,false) 
                }, 1000)
                setLabel(response.data.label)
                */
            }, 'image/png', 1)

        }
    }

    

}

export default ImageClassificationPage