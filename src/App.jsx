import * as THREE from 'three'
import React, { Suspense, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Reflector, Text, useTexture, useGLTF } from '@react-three/drei'

export default function App() {
  return (
    <Canvas concurrent gl={{ alpha: false }} pixelRatio={[1, 1.5]} camera={{ position: [0, 3, 100], fov: 15 }}>
      <color attach="background" args={['black']} />
      <fog attach="fog" args={['black', 15, 20]} />
      <Suspense fallback={null}>
        <group position={[0, -1, 0]}>
          <Carla rotation={[0, Math.PI - 0.4, 0]} position={[-1.2, 0, 0.6]} scale={[0.26, 0.26, 0.26]} /> //model untuk menambahkan orang
          {/* Ubah VideoText untuk menerima daftar video */}
          <VideoText position={[0, 1.3, -2]} videos={['/1.mp4', '/2.mp4', '/3.mp4', '/4.mp4', '/5.mp4']} />
          <Ground />
        </group>
        <ambientLight intensity={0.5} />
        <spotLight position={[0, 10, 0]} intensity={0.3} />
        <directionalLight position={[-50, 0, -40]} intensity={0.7} />
        <Intro />
      </Suspense>
    </Canvas>
  )
}

function Carla(props) {
  const { scene } = useGLTF('/carla-draco.glb')
  return <primitive object={scene} {...props} />
}

// Function VideoText dengan mendukung banyak video
function VideoText({ videos, ...props }) {
  const [videoElement] = useState(() => document.createElement('video'))
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  useEffect(() => {
    // Konfigurasi elemen video
    videoElement.crossOrigin = 'Anonymous'
    videoElement.muted = true
    videoElement.loop = false // Looping diatur manual untuk daftar video
    videoElement.src = videos[currentVideoIndex] // Atur video awal
    videoElement.play()

    // Event listener untuk mendeteksi akhir video
    const handleVideoEnd = () => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length)
    }

    videoElement.addEventListener('ended', handleVideoEnd)

    return () => {
      videoElement.pause() // Hentikan video saat komponen dilepas
      videoElement.removeEventListener('ended', handleVideoEnd)
    }
  }, [videoElement, videos, currentVideoIndex])

  // Update video source saat indeks berubah
  useEffect(() => {
    videoElement.src = videos[currentVideoIndex]
    videoElement.play()
  }, [currentVideoIndex, videoElement, videos])

  return (
    <Text font="/Inter-Bold.woff" fontSize={3} letterSpacing={-0.06} {...props}>
      Anime
      <meshBasicMaterial toneMapped={false}>
        <videoTexture attach="map" args={[videoElement]} encoding={THREE.sRGBEncoding} />
      </meshBasicMaterial>
    </Text>
  )
}

function Ground() {
  const [floor, normal] = useTexture(['/SurfaceImperfections003_1K_var1.jpg', '/SurfaceImperfections003_1K_Normal.jpg'])
  return (
    <Reflector blur={[400, 100]} resolution={512} args={[10, 10]} mirror={0.5} mixBlur={6} mixStrength={1.5} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
      {(Material, props) => <Material color="#a0a0a0" metalness={0.4} roughnessMap={floor} normalMap={normal} normalScale={[2, 2]} {...props} />}
    </Reflector>
  )
}

function Intro() {
  const [vec] = useState(() => new THREE.Vector3())
  return useFrame((state) => {
    state.camera.position.lerp(vec.set(state.mouse.x * 5, 3 + state.mouse.y * 2, 14), 0.05)
    state.camera.lookAt(0, 0, 0)
  })
}
