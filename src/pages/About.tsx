export function About() {
  return (
    <article className="about-page">
      <h1 className="display" style={{ fontSize: "clamp(2.1rem, 5vw, 3.6rem)" }}>Method, Accessibility & Transparency</h1>
      <p className="slogan">The Earth Information Jukebox</p>

      <section>
        <h2>How We Translate Sight into Sound</h2>
        <p>
          Each place you choose is one pixel on an official NASA equirectangular frame. That pixel becomes a number between low and high, and the number drives the sound in one direction only. A brighter night pulses faster. Greener vegetation opens a warmer chord. Heavier particle color muffles the air instead of prettifying it. The same pixel always makes the same sound. Nothing is rolled at random.
        </p>
        <p>
          The numbers on the portrait are read from the picture&apos;s own color scale. They are not a new satellite retrieval, and they are not a medical or weather warning. Where the frame has no measurement — land on the sea-temperature map, for example — the layer stays quiet and says so.
        </p>
      </section>

      <section>
        <h2>Accessibility First</h2>
        <p>
          The globe works from the keyboard: arrow keys move five degrees, Shift moves ten, and Enter starts the sound. A live region speaks the three lines of the Sound Portrait for screen readers. How to Read the Sounds plays the low, middle, and high of every layer without the picture. The 2D Map uses the same frames and the same readings when WebGL is unavailable or when you prefer a flat image. Motion eases off when the system asks for reduced motion, and the Earth stops spinning as soon as you touch it.
        </p>
      </section>

      <section>
        <h2>NASA Media & Data Attribution</h2>
        <p>
          Night lights: SVS 5475, Black Marble. Aerosols: SVS 5552, GEOS. Vegetation: NASA MODIS MYD13C1 NDVI (the SVS 5544 release is a film). Air quality: SVS 5518, GEOS-CF PM2.5. Sea temperature: SVS 5101, MUR SST. Lightning: SVS 5011, LIS on the International Space Station. The star field behind the globe is artistic ambience, not a catalog.
        </p>
      </section>

      <section>
        <h2>AI Tools Disclosure</h2>
        <p>
          The interface and the sound engine were built with the help of an AI coding assistant in Cursor. The NASA frames, the mapping rules, and the scientific wording were checked against the Scientific Visualization Studio pages linked in the Data Library. NASA did not operate the tool and does not endorse the result.
        </p>
      </section>
    </article>
  )
}
