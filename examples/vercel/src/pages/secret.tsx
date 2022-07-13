import GitHubIcon from "@mui/icons-material/GitHub";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import { signIn, signOut } from "@pforte/client";
import { useSession } from "@pforte/react";

export default function Secret() {
	const session = useSession();
	return (
		<>
			{session ? (
				<>
					<Typography>I am secret</Typography>
					<Button onClick={signOut}>Sign Out</Button>
				</>
			) : (
				<>
					<Typography>Secret Page</Typography>
					<Button
						startIcon={<GitHubIcon />}
						onClick={() => {
							void signIn("github");
						}}
					>
						Sign In
					</Button>
				</>
			)}
		</>
	);
}
