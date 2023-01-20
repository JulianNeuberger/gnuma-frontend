import {AnnoColor} from "../../state/anno/annoEntitySetReducer";

export const getButtonStyle = (color: AnnoColor) => {
    return (
        {
            'color': color.main,
            'background': color.background,
            'borderColor': color.main,
            'margin': '5px'
        }
    );
}

export const getRandomColor = () => {
    let r = Math.floor(Math.random() * 250)
    let r2 = Math.min(r + 100, 255)
    let g = Math.floor(Math.random() * 250)
    let g2 = Math.min(g + 100, 255)
    let b = Math.floor(Math.random() * 250)
    let b2 = Math.min(b + 100, 255)

    let main_col = '#' + r.toString(16) + g.toString(16) + b.toString(16);
    let background_col = '#' + r2.toString(16) + g2.toString(16) + b2.toString(16);

    let random_color: AnnoColor = {
        main: main_col,
        background: background_col
    };

    console.log(random_color);

    return random_color;
}