export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <strong>Bibliotecas Populares de San Juan</strong>
          <p>Red de bibliotecas populares de la provincia de San Juan, Argentina.</p>
        </div>
        <div className="footer-social">
          <a href="https://www.youtube.com/@DBPSJ" target="_blank" rel="noopener noreferrer">YouTube</a>
          <a href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
      </div>
      <p className="footer-copy">© {new Date().getFullYear()} Bibliotecas Populares de San Juan</p>
    </footer>
  );
}
