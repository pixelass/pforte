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

export default function App() {
	const session = useSession();
	return (
		<>
			<Typography variant="h3" component="h1">
				Pforte{" "}
				<Typography variant="caption" component="span">
					[ˈpfɔrtə]
				</Typography>
			</Typography>
			{session ? (
				<Card sx={{ maxWidth: 300 }}>
					<CardHeader
						avatar={<Avatar src={session.user.image} aria-label={session.user.name} />}
						title={session.user.name}
					/>
					<CardContent>
						<Typography>Welcome {session.user.name}</Typography>
					</CardContent>
					<CardActions>
						<Button onClick={signOut}>Sign Out</Button>
					</CardActions>
				</Card>
			) : (
				<>
					<Typography>Sign in to see some magic!</Typography>
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
