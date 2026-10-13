export interface DuckModel {
  id: string;
  title: string;
  url: string;
  author: string;
  source: string;
  license: string;
  // Some Sketchfab exports flag opaque materials as alpha-blended, which
  // causes depth-sorting artifacts. Don't set this on models with real glass.
  forceOpaque?: boolean;
  // Frame the model on its opaque meshes only, for files whose transparent
  // parts contain stray geometry that would shrink the visible model.
  fitOpaqueOnly?: boolean;
  // Degrees to turn the model about Y so its beak points along +Z, which is
  // the axis follow mode aims at the cursor. Only applied while following.
  followYaw?: number;
  // Multiplier on the scene lights for models whose matte materials read too
  // dark under the shared rig.
  lightBoost?: number;
}

export const MODELS: DuckModel[] = [
  {
    id: "classic",
    title: "Rubber Duck",
    url: "/models/rubber_duck.glb",
    author: "Albert Gregl",
    source: "https://sketchfab.com/3d-models/rubber-duck-7eb15f3c897049f8ba35f8f56f081dff",
    license: "CC BY-NC 4.0",
    forceOpaque: true,
    followYaw: -30,
  },
  {
    id: "ducky",
    title: "Rubber Ducky",
    url: "/models/rubber_ducky.glb",
    author: "R3indeer",
    source: "https://sketchfab.com/3d-models/rubber-ducky-652fb859ddbc403a9d799e91c0468ef0",
    license: "CC BY 4.0",
  },
  {
    id: "toy",
    title: "Rubber Duck Toy",
    url: "/models/rubber_duck_toy.glb",
    author: "Prince Obrymec",
    source: "https://sketchfab.com/3d-models/rubber-duck-toy-2fcdc70227df4aafb1d96be15fa622f0",
    license: "Sketchfab Standard",
    lightBoost: 3.5,
  },
  {
    id: "pond",
    title: "Low poly Duck",
    url: "/models/rubber_duck(1).glb",
    author: "shalimman",
    source: "https://sketchfab.com/3d-models/rubber-duck-8ac5f3720341416b8818cb20f90f2f10",
    license: "Sketchfab Standard",
  },
  {
    id: "inflatable",
    title: "Inflatable Duck",
    url: "/models/rubber_inflatable_duck.glb",
    author: "dmitriev.ivan.d",
    source: "https://sketchfab.com/3d-models/rubber-inflatable-duck-e41d336c0ba54a1b818685c5bb2d2197",
    license: "CC BY 4.0",
    followYaw: -90,
  },
  {
    id: "batman",
    title: "Batduck",
    url: "/models/batman_rubber_duck.glb",
    author: "Qlone",
    source: "https://sketchfab.com/3d-models/batman-rubber-duck-fe08ae4ab8a24f6498b9b79644185c6f",
    license: "CC BY-ND 4.0",
    followYaw: -45,
  },
  {
    id: "poochi",
    title: "Poo Chi Duck",
    url: "/models/poo_chi_rubber_duck.glb",
    author: "Gaspar.Gaspar1",
    source: "https://sketchfab.com/3d-models/poo-chi-rubber-duck-e72063d028c54a4986fe56dbfd37a694",
    license: "CC BY 4.0",
    fitOpaqueOnly: true,
  },
  {
    id: "steamduck",
    title: "Steamduck",
    url: "/models/steamduck.glb",
    author: "ramon_asekas",
    source: "https://sketchfab.com/3d-models/steamduck-9b79537e6de447d8bb6e5a6123d0b794",
    license: "CC BY 4.0",
    followYaw: -90,
  },
  {
    id: "ducksaw",
    title: "Ducksaw",
    url: "/models/ducksaw.glb",
    author: "Duznot",
    source: "https://sketchfab.com/3d-models/ducksaw-4d11de9629a044fab33d16c167ef7ced",
    license: "CC BY 4.0",
    lightBoost: 3.5,
  },
];

// Static preview shown in the model picker; regenerate with `npm run thumbs`.
export const thumbnailUrl = (model: DuckModel) => `/models/thumbs/${model.id}.webp`;
