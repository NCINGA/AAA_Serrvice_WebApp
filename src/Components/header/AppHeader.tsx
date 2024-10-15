import React, {FC} from "react";

type Props = {
    title: any
    subtitle?: any
}
const AppHeader: FC<Props> = ({title, subtitle}) => {
    return (<React.Fragment>
        <div style={{background: 'linear-gradient(139deg, rgba(255,255,255,1) 12%, rgba(175,223,255,0.5) 90%)', backdropFilter: 'blur(10px)',}}
             className={"fixed z-5 w-full mt-3"}>
            <h1>{title}</h1>
        </div>

    </React.Fragment>)
}

export default AppHeader;
