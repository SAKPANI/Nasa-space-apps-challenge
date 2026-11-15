import { useEffect, useMemo, useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import gsap from "gsap"
import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  DataTexture,
  DoubleSide,
  Mesh,
  Quaternion,
  ShaderMaterial,
  Texture,
  Vector3,
} from "three"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import { EARTH_RADIUS, latLonToVector } from "./geo"

const earthVertex = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const earthFragment = `
uniform sampler2D uMapA;
uniform sampler2D uMapB;
uniform float uMix;
varying vec2 vUv;
void main() {
  vec4 a = texture2D(uMapA, vUv);
  vec4 b = texture2D(uMapB, vUv);
  gl_FragColor = vec4(mix(a.rgb, b.rgb, uMix), 1.0);
}
`

const airVertex = `
varying vec3 vNormal;
varying vec3 vWorld;
void main() {
  vNormal = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

const airFragment = `
varying vec3 vNormal;
varying vec3 vWorld;
uniform vec3 uColor;
uniform float uStrength;
void main() {
  vec3 viewDir = normalize(cameraPosition - vWorld);
  float fresnel = pow(1.0 - abs(dot(normalize(vNormal), viewDir)), 2.6);
  vec3 limb = mix(vec3(0.10, 0.48, 0.78), vec3(0.91, 0.64, 0.09), fresnel);
  vec3 glow = mix(uColor, limb, 0.62);
  gl_FragColor = vec4(glow, fresnel * uStrength);
}
`

function mulberry32(seed: number): () => number {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function StarField() {
  const geometry = useMemo(() => {
    const random = mulberry32(5475)
    const count = 700
    const positions = new Float32Array(count * 3)
    for (let index = 0; index < count; index += 1) {
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)
      const radius = 22 + random() * 18
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[index * 3 + 2] = radius * Math.cos(phi)
    }
    const geo = new BufferGeometry()
    geo.setAttribute("position", new BufferAttribute(positions, 3))
    return geo
  }, [])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#d7e3f2" size={0.045} sizeAttenuation transparent opacity={0.8} depthWrite={false} />
    </points>
  )
}

function Marker({ lat, lon, pulse, reduced }: { lat: number; lon: number; pulse: number; reduced: boolean }) {
  const ring = useRef<Mesh>(null)
  const echo = useRef<Mesh>(null)
  const position = latLonToVector(lat, lon, EARTH_RADIUS + 0.035)
  const normal = new Vector3(...latLonToVector(lat, lon, 1)).normalize()
  const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), normal)

  useFrame(({ clock }) => {
    const beat = reduced ? pulse : pulse * 0.8 + 0.2 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * (2.2 + pulse * 6)))
    ring.current?.scale.setScalar(1 + beat * 1.4)
    echo.current?.scale.setScalar(1.35 + beat * 1.8)
  })

  return (
    <group position={position} quaternion={quaternion}>
      <mesh ref={ring}>
        <ringGeometry args={[0.07, 0.096, 48]} />
        <meshBasicMaterial color="#e8a317" transparent opacity={0.9} side={DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={echo}>
        <ringGeometry args={[0.1, 0.116, 48]} />
        <meshBasicMaterial color="#1e9bd7" transparent opacity={0.45} side={DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <sphereGeometry args={[0.036, 16, 16]} />
        <meshBasicMaterial color="#f4f7fb" />
      </mesh>
    </group>
  )
}

export type SceneProps = {
  from: string
  to: string
  mix: number
  tint: string
  lat: number | null
  lon: number | null
  pulse: number
  reduced: boolean
  flyKey: number
  onPick: (lat: number, lon: number) => void
  onMissing?: () => void
}

function blankTexture(): DataTexture {
  const texture = new DataTexture(new Uint8Array([7, 28, 51, 255]), 1, 1)
  texture.needsUpdate = true
  return texture
}

export function GlobeScene({ from, to, mix, tint, lat, lon, pulse, reduced, flyKey, onPick, onMissing }: SceneProps) {
  const { camera } = useThree()
  const controls = useRef<OrbitControlsImpl>(null)
  const [textured, setTextured] = useState(false)
  const [spinning, setSpinning] = useState(!reduced)

  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uMapA: { value: blankTexture() },
          uMapB: { value: blankTexture() },
          uMix: { value: mix },
        },
        vertexShader: earthVertex,
        fragmentShader: earthFragment,
      }),
    // The material is kept and its uniforms are written below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const atmosphere = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uColor: { value: new Color(tint) },
          uStrength: { value: 0.72 },
        },
        vertexShader: airVertex,
        fragmentShader: airFragment,
        transparent: true,
        depthWrite: false,
        side: BackSide,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => {
    let cancel = false
    const load = async (url: string) => {
      const response = await fetch(url)
      const type = response.headers.get("content-type") ?? ""
      if (!response.ok || !type.startsWith("image/")) throw new Error(url)
      const bitmap = await createImageBitmap(await response.blob())
      const texture = new Texture(bitmap)
      texture.needsUpdate = true
      texture.anisotropy = 8
      texture.flipY = false
      return texture
    }
    Promise.all([load(from), load(to)])
      .then(([mapA, mapB]) => {
        if (cancel) {
          mapA.dispose()
          mapB.dispose()
          return
        }
        mapA.anisotropy = 4
        mapB.anisotropy = 4
        const previousA = material.uniforms.uMapA.value as Texture
        const previousB = material.uniforms.uMapB.value as Texture
        material.uniforms.uMapA.value = mapA
        material.uniforms.uMapB.value = mapB
        previousA.dispose()
        if (previousB !== previousA) previousB.dispose()
        setTextured(true)
      })
      .catch(() => {
        if (!cancel) {
          setTextured(false)
          onMissing?.()
        }
      })
    return () => {
      cancel = true
    }
  }, [from, to, material, onMissing])

  useEffect(() => {
    material.uniforms.uMix.value = mix
  }, [mix, material])

  useEffect(() => {
    atmosphere.uniforms.uColor.value = new Color(tint)
  }, [tint, atmosphere])

  useEffect(
    () => () => {
      material.dispose()
      atmosphere.dispose()
    },
    [material, atmosphere],
  )

  useEffect(() => {
    if (lat === null || lon === null || flyKey === 0) return
    const distance = Math.min(EARTH_RADIUS * 4.4, Math.max(EARTH_RADIUS * 1.45, camera.position.length()))
    const [x, y, z] = latLonToVector(lat, lon, distance)
    setSpinning(false)
    if (controls.current) controls.current.enabled = false
    const tween = gsap.to(camera.position, {
      x,
      y,
      z,
      duration: reduced ? 0 : 1.35,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.lookAt(0, 0, 0)
        controls.current?.target.set(0, 0, 0)
        controls.current?.update()
      },
      onComplete: () => {
        if (controls.current) controls.current.enabled = true
      },
    })
    return () => {
      tween.kill()
    }
  }, [flyKey, lat, lon, camera, reduced])

  return (
    <>
      <color attach="background" args={["#05070d"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 2, 3]} intensity={1.4} />
      <StarField />
      {textured ? (
        <mesh
          material={material}
          onClick={(event) => {
            event.stopPropagation()
            const uv = event.uv
            if (!uv) return
            onPick(uv.y * 180 - 90, uv.x * 360 - 180)
          }}
        >
          <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        </mesh>
      ) : (
        <mesh
          onClick={(event) => {
            event.stopPropagation()
            const uv = event.uv
            if (!uv) return
            onPick(uv.y * 180 - 90, uv.x * 360 - 180)
          }}
        >
          <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
          <meshStandardMaterial color="#1a4c78" roughness={0.55} metalness={0.05} />
        </mesh>
      )}
      {lat !== null && lon !== null ? <Marker lat={lat} lon={lon} pulse={pulse} reduced={reduced} /> : null}
      <mesh material={atmosphere} scale={1.045}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 48]} />
      </mesh>
      <OrbitControls
        ref={controls}
        enableDamping
        dampingFactor={0.05}
        enablePan={false}
        minDistance={EARTH_RADIUS * 1.25}
        maxDistance={EARTH_RADIUS * 4.6}
        rotateSpeed={0.55}
        zoomSpeed={0.7}
        autoRotate={spinning && !reduced}
        autoRotateSpeed={0.42}
        onStart={() => setSpinning(false)}
      />
    </>
  )
}
