import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField({ count = 5000 }) {
    const points = useRef();

    const particles = useMemo(() => {
        const temp = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            temp[i * 3] = (Math.random() - 0.5) * 50;
            temp[i * 3 + 1] = (Math.random() - 0.5) * 50;
            temp[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }
        return temp;
    }, [count]);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        points.current.rotation.y = time * 0.05;
        points.current.rotation.x = time * 0.02;

        // Subtle mouse reaction
        points.current.position.x = THREE.MathUtils.lerp(points.current.position.x, state.mouse.x * 2, 0.05);
        points.current.position.y = THREE.MathUtils.lerp(points.current.position.y, state.mouse.y * 2, 0.05);
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={points} positions={particles} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#8b5cf6"
                    size={0.05}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>
        </group>
    );
}

function Nebula() {
    return (
        <group>
            <mesh position={[10, 5, -20]}>
                <sphereGeometry args={[15, 32, 32]} />
                <meshBasicMaterial color="#4c1d95" transparent opacity={0.1} />
            </mesh>
            <mesh position={[-15, -10, -30]}>
                <sphereGeometry args={[25, 32, 32]} />
                <meshBasicMaterial color="#1e1b4b" transparent opacity={0.15} />
            </mesh>
        </group>
    )
}

export default function SplineScene() {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 0,
            background: 'radial-gradient(circle at center, #0a0a1a 0%, #000 100%)'
        }}>
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={60} />
                <ParticleField count={8000} />
                <Nebula />
                <ambientLight intensity={0.5} />
            </Canvas>
        </div>
    );
}
