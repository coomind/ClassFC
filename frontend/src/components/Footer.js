import logo from "../assets/classfc-logo.png";
import "../styles/footer.css";

function Footer() {
  return (
    <footer className="fc-footer">
      <div className="container">
        <div className="fc-footer-grid">
          <div className="fc-footer-col">
            <div className="fc-footer-brand-row">
              <img src={logo} alt="CLASS FC" className="fc-footer-logo" />
              <div className="fc-footer-brand">CLASS FC</div>
            </div>

            <div className="fc-footer-tag">
              Building the digital home of our football family.
            </div>

            <div className="fc-footer-est">
              EST. 2013 · DEPT. OF SOFTWARE
            </div>
          </div>

          <div className="fc-footer-col">
            <div className="fc-footer-heading">CLUB</div>
            <div className="fc-footer-line">CLASS FC</div>
            <div className="fc-footer-line">Department of Software</div>
            <div className="fc-footer-line">Established 2013</div>
          </div>

          <div className="fc-footer-col">
            <div className="fc-footer-heading">CONTACT</div>
            <div className="fc-footer-line">충북대학교 S4-1</div>
          </div>

          <div className="fc-footer-col">
            <div className="fc-footer-heading">FOLLOW</div>

            {/* SNS 링크 */}
            <div className="fc-sns-row">
              <a
                className="fc-sns"
                href="https://www.instagram.com/class2013_/"
                target="_blank"
                rel="noopener noreferrer"
              >
                IG
              </a>

              <a
                className="fc-sns"
                href="https://youtube.com/channel/UCky2vFwGrVyndn-LpSYrkYg?si=9TNYXu1-A7y0fokE"
                target="_blank"
                rel="noopener noreferrer"
              >
                YT
              </a>

              <a
                className="fc-sns"
                href="https://github.com/coomind/ClassFC"
                target="_blank"
                rel="noopener noreferrer"
              >
                GH
              </a>
            </div>
          </div>
        </div>

        <div className="fc-footer-bottom">
          <div>© 2026 CLASS FC. All rights reserved.</div>

          <div className="fc-footer-small">
            Made for our club by team CLASS · 차형창 · 이성준 · 김태효
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;


/*
import logo from "../assets/classfc-logo.png";
import "../styles/footer.css";

function Footer() {
  return (
    <footer className="fc-footer">
      <div className="container">
        <div className="fc-footer-grid">
          <div className="fc-footer-col">
            <div className="fc-footer-brand-row">
              <img src={logo} alt="CLASS FC" className="fc-footer-logo" />
              <div className="fc-footer-brand">CLASS FC</div>
            </div>
            <div className="fc-footer-tag">Building the digital home of our football family.</div>
            <div className="fc-footer-est">EST. 2013 · DEPT. OF SOFTWARE</div>
          </div>

          <div className="fc-footer-col">
            <div className="fc-footer-heading">CLUB</div>
            <div className="fc-footer-line">CLASS FC</div>
            <div className="fc-footer-line">Department of Software</div>
            <div className="fc-footer-line">Established 2013</div>
          </div>

          <div className="fc-footer-col">
            <div className="fc-footer-heading">CONTACT</div>
            <div className="fc-footer-line">충북대학교 S4-1</div>
          </div>

          <div className="fc-footer-col">
            <div className="fc-footer-heading">FOLLOW</div>
            <div className="fc-sns-row">
               <a className="fc-sns" href="https://www.instagram.com/class2013_/" target="_blank" rel="noopener noreferrer">IG</a>
               <a className="fc-sns" href="https://youtube.com/channel/UCky2vFwGrVyndn-LpSYrkYg?si=9TNYXu1-A7y0fokE" target="_blank" rel="noopener noreferrer">YT</a>
               <a className="fc-sns" href="https://github.com/coomind/ClassFC" target="_blank" rel="noopener noreferrer">GH</a>
            </div>
          </div>
        </div>

        <div className="fc-footer-bottom">
          <div>© 2026 CLASS FC. All rights reserved.</div>
          <div className="fc-footer-small">
            Made for our club by team CLASS · 차형창 · 이성준 · 김태효
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
*/
