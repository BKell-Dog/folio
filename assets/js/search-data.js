// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/folio/";
    },
  },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/folio/blog/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "A growing collection of your cool projects.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/folio/projects/";
          },
        },{id: "nav-repositories",
          title: "repositories",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/folio/repositories/";
          },
        },{id: "nav-cv",
          title: "cv",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/folio/cv/";
          },
        },{id: "nav-bookshelf",
          title: "bookshelf",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/folio/books/";
          },
        },{id: "post-esp32-cam-home-security-cameras",
        
          title: "ESP32 CAM Home Security Cameras",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/folio/blog/2025/ESP32-CAM-Home-Security-Cameras/";
          
        },
      },{id: "post-rewriting-hexo-39-s-rss-renderer",
        
          title: "Rewriting Hexo&#39;s RSS Renderer",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/folio/blog/2025/Rewriting-Hexo's-RSS-Renderer/";
          
        },
      },{id: "post-dfplayer-mini-uart-control",
        
          title: "DFPlayer Mini UART Control",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/folio/blog/2025/DFPlayer-Mini-UART-Control/";
          
        },
      },{id: "post-kt0803l-i-c-control-part-1-basic-i-c",
        
          title: "KT0803L I²C Control - Part 1 - Basic I²C",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/folio/blog/2025/KT0803L-I2C-Control-Part-1-Basic-I2C/";
          
        },
      },{id: "post-3d-website-design-part-2-3d-models-and-rendering",
        
          title: "3D Website Design - Part 2 - 3D Models and Rendering",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/folio/blog/2025/3D-Website-Design-Part-2/";
          
        },
      },{id: "post-3d-website-design-part-1-three-js-setup",
        
          title: "3D Website Design - Part 1 - Three.js Setup",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/folio/blog/2025/3D-Website-Design-Part-1/";
          
        },
      },{id: "post-the-ch32v003-microcontroller-part-1-setup-and-basic-script",
        
          title: "The CH32V003 Microcontroller - Part 1 - Setup and Basic Script",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/folio/blog/2025/CH32V003-Part-1/";
          
        },
      },{id: "post-power-supply-design-part-1-teardown",
        
          title: "Power Supply Design - Part 1 - Teardown",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/folio/blog/2025/Power-Supply-Design-Part-1/";
          
        },
      },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/folio/books/the_godfather/";
            },},{id: "projects-project-1",
          title: 'project 1',
          description: "with background image",
          section: "Projects",handler: () => {
              window.location.href = "/folio/projects/1_project/";
            },},{id: "projects-project-2",
          title: 'project 2',
          description: "a project with a background image and giscus comments",
          section: "Projects",handler: () => {
              window.location.href = "/folio/projects/2_project/";
            },},{id: "projects-project-3-with-very-long-name",
          title: 'project 3 with very long name',
          description: "a project that redirects to another website",
          section: "Projects",handler: () => {
              window.location.href = "/folio/projects/3_project/";
            },},{id: "projects-project-4",
          title: 'project 4',
          description: "another without an image",
          section: "Projects",handler: () => {
              window.location.href = "/folio/projects/4_project/";
            },},{id: "projects-project-5",
          title: 'project 5',
          description: "a project with a background image",
          section: "Projects",handler: () => {
              window.location.href = "/folio/projects/5_project/";
            },},{id: "projects-project-6",
          title: 'project 6',
          description: "a project with no image",
          section: "Projects",handler: () => {
              window.location.href = "/folio/projects/6_project/";
            },},{id: "projects-project-7",
          title: 'project 7',
          description: "with background image",
          section: "Projects",handler: () => {
              window.location.href = "/folio/projects/7_project/";
            },},{id: "projects-project-8",
          title: 'project 8',
          description: "an other project with a background image and giscus comments",
          section: "Projects",handler: () => {
              window.location.href = "/folio/projects/8_project/";
            },},{id: "projects-project-9",
          title: 'project 9',
          description: "another project with an image 🎉",
          section: "Projects",handler: () => {
              window.location.href = "/folio/projects/9_project/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%79%6F%75@%65%78%61%6D%70%6C%65.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-inspire',
        title: 'Inspire HEP',
        section: 'Socials',
        handler: () => {
          window.open("https://inspirehep.net/authors/1010907", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/folio/feed.xml", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=qc6CJjYAAAAJ", "_blank");
        },
      },{
        id: 'social-custom_social',
        title: 'Custom_social',
        section: 'Socials',
        handler: () => {
          window.open("https://www.alberteinstein.com/", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
