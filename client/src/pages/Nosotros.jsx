import { Helmet } from 'react-helmet-async';

export default function Nosotros() {
  return (
    <div className="section container nosotros">
      <Helmet>
        <title>Institucional | Dirección de Bibliotecas Populares — San Juan</title>
        <meta name="description" content="Misión, visión y objetivos de la Dirección de Bibliotecas Populares y Actividades Literarias de San Juan. 56 bibliotecas populares en 19 departamentos." />
      </Helmet>
      <h1>Dirección de Bibliotecas Populares<br />y Actividades Literarias de San Juan</h1>
      <p className="nosotros-subtitle">Organismo del Gobierno de la Provincia de San Juan</p>

      <h3>Misión</h3>
      <p>
        Promover y estimular las Bibliotecas Populares como canales abiertos para la difusión
        y promoción de la lectura de la mano de acciones culturales de distintas expresiones.
      </p>

      <h3>Visión</h3>
      <p>
        Lograr que cada biblioteca popular se convierta también en un Centro de Gestión Cultural,
        inmerso en cada comunidad donde existe o donde se crea. Las Bibliotecas Populares son
        entidades de acceso público, destinadas a todo público, sin excluir a nadie.
      </p>
      <p>
        En la Provincia de San Juan existen 56 Bibliotecas Populares distribuidas en los
        departamentos, amparadas por el Decreto N.º 1167/12 sobre Fomento y Regularización de
        las Bibliotecas Populares, trabajando en conjunto con la{' '}
        <a href="https://www.conabip.gob.ar/" target="_blank" rel="noopener noreferrer">CONABIP</a>.
      </p>

      <h3>Objetivos Estratégicos</h3>
      <ol>
        <li>Proteger y fomentar a las Bibliotecas Populares de toda la provincia, existentes y a crearse.</li>
        <li>Planificar y proyectar actividades destinadas al crecimiento de las Bibliotecas Populares.</li>
        <li>Organizar conferencias, cursos, talleres y charlas para el perfeccionamiento de bibliotecas y personal.</li>
        <li>Estimular el entrenamiento en ofimática y administración de Digibepe.</li>
        <li>Promocionar la actividad literaria local y de autores sanjuaninos.</li>
        <li>Estimular acciones que acerquen a la comunidad a la Biblioteca Popular.</li>
      </ol>

      <h3>Valores Compartidos</h3>
      <p>
        Trabajo en equipo junto a la Federación de Bibliotecas Populares, respeto por el espacio
        funcional de cada integrante, y compromiso con el mejor servicio a la comunidad: bibliotecas,
        bibliotecarios, escritores, editoriales y lectores.
      </p>

      <h3>Ferias del Libro</h3>
      <p>
        La provincia participa históricamente en la Feria Internacional del Libro de Buenos Aires,
        la más grande de Latinoamérica, fomentando la escritura y lectura local.
      </p>
    </div>
  );
}
