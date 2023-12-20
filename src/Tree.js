import { BoxGeometry, Mesh, MeshStandardMaterial, Object3D } from 'three'

const geometry = new BoxGeometry(1, 1, 1)
const white = new MeshStandardMaterial({ color: 'white' })
const green = new MeshStandardMaterial({ color: '#4e8905' })
const brown = new MeshStandardMaterial({ color: '#7E4C22' })

export default class Tree {
	constructor() {
		const tree = new Object3D()
		const frustum = new Mesh(geometry, brown)

		frustum.position.y = 0.5
		tree.add(frustum)

		const top = new Mesh(geometry, green)
		top.scale.y = 2
		top.position.y = 1.5

		const side = new Mesh(geometry, green)
		const snow = new Mesh(geometry, white)

		const sides = [
			[0.75, 0],
			[0, 0.75],
			[-0.75, 0],
			[0, -0.75],
		].map(([x, z]) => {
			const o = new Object3D()
			o.add(side.clone())
			o.add(snow.clone())

			o.children.forEach((c, i) => {
				c.scale.y = 0.5
				c.scale.x = x !== 0 ? 0.5 : 1
				c.scale.z = z !== 0 ? 0.5 : 1
				c.position.y = 0.25 + 0.5 * i
			})

			// o.position.x = i + 1
			o.position.set(x, 0.5, z)

			return o
		})

		tree.add(top, ...sides)

		this.mesh = tree
	}
}
