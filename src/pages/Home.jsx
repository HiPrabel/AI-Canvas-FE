import { useEffect, useRef, useState } from 'react';
import { ColorSwatch, Group } from '@mantine/core';
import { Button } from '../components/Button.jsx';
import DraggableLatex from '../components/DraggableLatex.jsx';
import { SWATCHES } from '../Constants.js';
import { LazyBrush } from 'lazy-brush';
import { Moon, Sun, Eraser, Pencil, LayoutGrid, Link, Github, Mail, Linkedin } from 'lucide-react';

export default function Home() {
    const canvasRef = useRef(null);
    const solveButtonRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('rgb(255, 0, 0)');
    const [reset, setReset] = useState(false);
    const [dictOfVars, setDictOfVars] = useState({});
    const [result, setResult] = useState();
    const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });
    const [latexExpression, setLatexExpression] = useState([]);
    const [showError, setShowError] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [tool, setTool] = useState('pencil');
    const [strokeSize, setStrokeSize] = useState(3);
    const [eraserSize, setEraserSize] = useState(10);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showSocialLinks, setShowSocialLinks] = useState(false);

    const lazyBrush = new LazyBrush({
        radius: 10,
        enabled: true,
        initialPoint: { x: 0, y: 0 },
    });

    const renderLatexToCanvas = (expression, answer) => {
        const latex = `\\(\\LARGE{${expression} = ${answer}}\\)`;
        setLatexExpression([...latexExpression, latex]);

        // Clear the main canvas
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };
    
    useEffect(() => {
        if (latexExpression.length > 0 && window.MathJax) {
            setTimeout(() => {
                window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
            }, 0);
        }
    }, [latexExpression]);

    useEffect(() => {
        if (result) {
            renderLatexToCanvas(result.expression, result.answer);
        }
    }, [result]);

    useEffect(() => {
        if (reset) {
            resetCanvas();
            setLatexExpression([]);
            setResult(undefined);
            setDictOfVars({});
            setReset(false);
        }
    }, [reset]);

    useEffect(() => {
        let timer;
        if (showError) {
            timer = setTimeout(() => {
                setShowError(false);
            }, 3000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [showError]);

    // Check for mobile device and handle resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
    
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const resizeCanvas = () => {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight - canvas.offsetTop;
                    ctx.lineCap = 'round';
                    ctx.lineWidth = strokeSize;
                };
                
                resizeCanvas();
                window.addEventListener('resize', resizeCanvas);
            }
            canvas.style.background = darkMode ? 'black' : 'white';
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML';
        script.async = true;
        document.head.appendChild(script);

        script.onload = () => {
            window.MathJax.Hub.Config({
                tex2jax: {inlineMath: [['$', '$'], ['\\(', '\\)']]},
            });
        };

        return () => {
            if (script.parentNode) {
                document.head.removeChild(script);
            }
            if (canvas) {
                window.removeEventListener('resize', () => {});
            }
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.background = darkMode ? 'black' : 'white';
        }
    }, [darkMode]);

    const resetCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const getEventCoordinates = (e) => {
        // Handle both mouse and touch events
        if (e.nativeEvent instanceof TouchEvent) {
            const touch = e.nativeEvent.touches[0] || e.nativeEvent.changedTouches[0];
            const rect = canvasRef.current.getBoundingClientRect();
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
        } else {
            return {
                x: e.nativeEvent.offsetX,
                y: e.nativeEvent.offsetY
            };
        }
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const coords = getEventCoordinates(e);
                ctx.beginPath();
                ctx.moveTo(coords.x, coords.y);
                
                if (tool === 'eraser') {
                    ctx.globalCompositeOperation = 'destination-out';
                    ctx.lineWidth = eraserSize;
                } else {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.strokeStyle = color;
                    ctx.lineWidth = strokeSize;
                }
                
                setIsDrawing(true);
            }
        }
    };
    
    const draw = (e) => {
        if (!isDrawing) {
            return;
        }
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                if (tool === 'pencil') {
                    ctx.strokeStyle = color;
                }
                const coords = getEventCoordinates(e);
                ctx.lineTo(coords.x, coords.y);
                ctx.stroke();
            }
        }
    };
    
    const stopDrawing = () => {
        setIsDrawing(false);
    };  

    const toggleDarkMode = () => {
        const isDark = !darkMode;
        setDarkMode(isDark);
        document.documentElement.classList.toggle('dark', isDark);
    };

    const runRoute = async () => {
        const canvas = canvasRef.current;
    
        if (solveButtonRef.current) {
            solveButtonRef.current.disabled = true;
        }

        if (canvas) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/calculate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        image: canvas.toDataURL('image/png'),
                        dict_of_vars: dictOfVars
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const resp = await response.json();
                console.log('Response', resp);
                
                resp.data.forEach((data) => {
                    if (data.assign === true) {
                        setDictOfVars({
                            ...dictOfVars,
                            [data.expr]: data.result
                        });
                    }
                });
                
                const ctx = canvas.getContext('2d');
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;

                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x++) {
                        const i = (y * canvas.width + x) * 4;
                        if (imageData.data[i + 3] > 0) {  // If pixel is not transparent
                            minX = Math.min(minX, x);
                            minY = Math.min(minY, y);
                            maxX = Math.max(maxX, x);
                            maxY = Math.max(maxY, y);
                        }
                    }
                }

                const centerX = (minX + maxX) / 2;
                const centerY = (minY + maxY) / 2;

                setLatexPosition({ x: centerX, y: centerY });
                resp.data.forEach((data) => {
                    setTimeout(() => {
                        setResult({
                            expression: data.expr,
                            answer: data.result
                        });
                    }, 1000);
                });
            } catch (error) {
                console.error("Error processing request:", error);
                setShowError(true);
            } finally {
                if (solveButtonRef.current) {
                    solveButtonRef.current.disabled = false;
                }
            }
        }
    };

    const SocialLinks = () => (
        <div className="flex flex-col space-y-2">
            <a 
                href="mailto:prabel397@gmail.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
                <Mail size={isMobile ? 16 : 18} className="mr-2" />
                <span className="text-sm">Email</span>
            </a>
            <a 
                href="https://github.com/HiPrabel" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
                <Github size={isMobile ? 16 : 18} className="mr-2" />
                <span className="text-sm">GitHub</span>
            </a>
            <a 
                href="https://www.linkedin.com/in/prabel-pandey/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
                <Linkedin size={isMobile ? 16 : 18} className="mr-2" />
                <span className="text-sm">LinkedIn</span>
            </a>
        </div>
    );

    return (
        <>
            <div className={`fixed top-0 w-full z-30 p-2 md:p-3 flex flex-wrap items-center justify-between gap-2 shadow-md ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <div className="flex gap-2">
                    {!isMobile && (
                        <div className="relative">
                            <Button 
                                onClick={() => {
                                    setShowSocialLinks(!showSocialLinks);
                                    setShowColorPicker(false);
                                }}
                                className="social-links-button m-1 p-1 md:p-2 bg-blue-600 hover:bg-blue-800 text-white"
                            >
                                <Link size={18} />
                            </Button>
                            
                            {showSocialLinks && (
                                <div className="social-links-dropdown absolute left-0 top-full mt-1.5 p-2 bg-white dark:bg-gray-800 dark:text-white rounded shadow-lg z-50 min-w-[150px]">
                                    <SocialLinks />
                                </div>
                            )}
                        </div>
                    )}

                    <Button onClick={() => setReset(true)} className="bg-gray-600 hover:bg-gray-800 text-white text-xs md:text-sm py-1 px-2 md:py-2 md:px-3">
                        Reset
                    </Button>
                    <Button onClick={toggleDarkMode} className='p-1 md:p-2 bg-gray-600 hover:bg-gray-800 text-white'>
                        {darkMode ? <Sun size={isMobile ? 16 : 18} /> : <Moon size={isMobile ? 16 : 18} />}
                    </Button>

                </div>

                <div className="flex gap-2 items-center">
                    <Button onClick={() => setTool('pencil')} 
                        className={`${
                            tool === 'pencil' ? 
                            'bg-blue-500 dark:bg-gray-800 border-2 border-white text-white hover:bg-blue-600 dark:hover:bg-gray-700' : 
                            'bg-gray-600 dark:bg-gray-600 hover:bg-gray-800 text-white dark:text-white'
                            } p-1 md:p-2`}>
                        <Pencil size={isMobile ? 16 : 18} />
                    </Button>
                    <Button onClick={() => setTool('eraser')} 
                        className={`${
                            tool === 'eraser' ? 
                            'bg-blue-500 dark:bg-gray-800 border-2 border-white text-white hover:bg-blue-600 dark:hover:bg-gray-700' : 
                            'bg-gray-600 dark:bg-gray-600 hover:bg-gray-800 text-white dark:text-white'
                            } p-1 md:p-2`}>
                        <Eraser size={isMobile ? 16 : 18} />
                    </Button>
                    <div className="hidden sm:flex flex-col items-start px-2 text-xs text-gray-600 dark:text-gray-300">
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={tool === 'pencil' ? strokeSize : eraserSize}
                            onChange={(e) =>
                            tool === 'pencil'
                                ? setStrokeSize(parseInt(e.target.value))
                                : setEraserSize(parseInt(e.target.value))
                            }
                            className="w-20 md:w-24"
                        />
                        <span>{tool === 'pencil' ? `Size: ${strokeSize}` : `Size: ${eraserSize}`}</span>
                    </div>
                </div>

                {/* slider in dropdown */}
                <div className="sm:hidden">
                    <Button 
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="p-1 bg-gray-600 hover:bg-gray-800 text-white"
                    >
                        <LayoutGrid size={16} />
                    </Button>
                </div>

                {!isMobile ? (
                    <Group className="flex gap-1 px-2 py-1 rounded bg-white dark:bg-gray-900">
                        {SWATCHES.map((swatch) => (
                        <ColorSwatch
                            key={swatch}
                            color={swatch}
                            onClick={() => {
                            setColor(swatch);
                            setTool('pencil');
                            }}
                            className={`cursor-pointer ring-offset-1 ${color === swatch ? 'ring-2 ring-blue-500' : ''}`}
                            size={isMobile ? 16 : 20}
                        />
                        ))}
                    </Group>
                ) : (
                    showColorPicker && (
                        <div className="absolute top-12 right-2 p-2 bg-white dark:bg-gray-800 rounded shadow-lg z-40">
                            <div className="grid grid-cols-4 gap-2 mb-3">
                                {SWATCHES.map((swatch) => (
                                <ColorSwatch
                                    key={swatch}
                                    color={swatch}
                                    onClick={() => {
                                        setColor(swatch);
                                        setTool('pencil');
                                        setShowColorPicker(false);
                                    }}
                                    className={`cursor-pointer ring-offset-1 ${color === swatch ? 'ring-2 ring-blue-500' : ''}`}
                                    size={24}
                                />
                                ))}
                            </div>
                            <div className="flex flex-col items-start text-xs text-gray-600 dark:text-gray-300">
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={tool === 'pencil' ? strokeSize : eraserSize}
                                    onChange={(e) =>
                                    tool === 'pencil'
                                        ? setStrokeSize(parseInt(e.target.value))
                                        : setEraserSize(parseInt(e.target.value))
                                    }
                                    className="w-full"
                                />
                                <span>{tool === 'pencil' ? `Size: ${strokeSize}` : `Size: ${eraserSize}`}</span>
                            </div>
                        </div>
                    )
                )}

                <Button 
                onClick={runRoute} 
                className="bg-green-600 hover:bg-green-700 text-white hover:scale-95 transition-transform duration-200 text-xs md:text-sm py-1 px-2 md:py-2 md:px-5"
                disabled={false}
                ref={solveButtonRef}
                >
                    Solve
                </Button>

                {isMobile && (
                    <div className="relative">
                        <Button 
                            onClick={() => {
                                setShowSocialLinks(!showSocialLinks);
                                setShowColorPicker(false);
                            }}
                            className="social-links-button m-1 p-1 md:p-2 bg-blue-600 hover:bg-blue-800 text-white"
                        >
                            <Link size={16} />
                        </Button>
                        
                        {showSocialLinks && (
                            <div className="social-links-dropdown absolute left-0 top-full mt-1 p-2 bg-white dark:bg-gray-800 dark:text-white rounded shadow-lg z-50 min-w-[150px]">
                                <SocialLinks />
                            </div>
                        )}
                    </div>
                )}
                
            </div>
            
            {showError && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-md shadow-lg z-50 flex items-center text-xs md:text-base">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6 mr-1 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Something went wrong, try again</span>
                </div>
            )}
            
            <canvas
                ref={canvasRef}
                id="canvas"
                className="absolute top-[52px] md:top-[64px] left-0 w-full h-[calc(100vh-52px)] md:h-[calc(100vh-64px)]"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onTouchCancel={stopDrawing}
            />

            {latexExpression && latexExpression.map((latex, index) => (
                <DraggableLatex
                    key={index}
                    latex={latex}
                    defaultPosition={latexPosition}
                    onStop={(e, data) => setLatexPosition({ x: data.x, y: data.y })}
                    darkMode={darkMode}
                />
            ))}
        </>
    );
}